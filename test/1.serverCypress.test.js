import assert from 'node:assert';
import { spawn } from 'node:child_process';
import http from 'node:http';
import { after, before, describe, it } from 'node:test';
import { millisecondsInOneHour, millisecondsInOneMinute, minutesToMillis } from '@cityssm/to-millis';
import { app, closePdfPuppeteer, shutdownAbuseCheck } from '../app/app.js';
import { portNumber } from './_globals.js';
const cypressTimeoutMillis = minutesToMillis(15);
const versionToRecord = 'v22';
let continueNextRun = true;
function runCypress(browser, done) {
    if (!continueNextRun) {
        assert.fail(`Skipping Cypress tests in ${browser} due to previous test failures`);
    }
    let finished = false;
    const finish = (error) => {
        if (finished)
            return;
        finished = true;
        done(error);
    };
    const cypressCommandArguments = [
        'run',
        '--config-file',
        'cypress.config.js',
        '--browser',
        browser,
        '--reporter',
        'spec'
    ];
    if ((process.env.CYPRESS_USE_LONGER_TIMEOUTS ?? '') === 'true') {
        cypressCommandArguments.push('--expose', 'useLongerTimeouts=true');
    }
    if ((process.env.CYPRESS_RECORD_KEY ?? '') !== '' &&
        process.version.startsWith(versionToRecord)) {
        cypressCommandArguments.push('--tag', `${browser},${process.version},${process.platform}`, '--record');
    }
    const childProcess = spawn('cypress', cypressCommandArguments, {
        env: process.env
    });
    childProcess.stdout.setEncoding('utf8');
    childProcess.stdout.on('data', (data) => {
        process.stdout.write(data);
    });
    childProcess.stderr.setEncoding('utf8');
    childProcess.stderr.on('data', (data) => {
        process.stderr.write(data);
    });
    const timeout = setTimeout(() => {
        continueNextRun = false;
        childProcess.kill('SIGKILL');
        finish(new Error(`Cypress timed out in ${browser} after ${cypressTimeoutMillis}ms`));
    }, cypressTimeoutMillis);
    childProcess.on('error', (error) => {
        clearTimeout(timeout);
        continueNextRun = false;
        finish(error instanceof Error ? error : new Error(String(error)));
    });
    childProcess.on('close', (code, signal) => {
        clearTimeout(timeout);
        if (code !== 0) {
            continueNextRun = false;
            finish(new Error(`Cypress failed in ${browser}: code=${code}, signal=${signal ?? ''}`));
            return;
        }
        finish();
    });
}
await describe('sunrise-cms', {
    timeout: millisecondsInOneHour
}, async () => {
    const httpServer = http.createServer(app);
    let serverStarted = false;
    before((_context, done) => {
        httpServer.listen(portNumber);
        httpServer.on('error', (error) => {
            serverStarted = false;
            console.error('Failed to start HTTP server:', error);
            done(error);
        });
        httpServer.on('listening', () => {
            serverStarted = true;
            done();
        });
    });
    after(async (_context, done) => {
        try {
            console.log('Shutting down server...');
            httpServer.close(() => {
                console.error('Server closed to new connections.');
            });
            httpServer.closeAllConnections();
            console.log('Server closed all connections.');
            console.log('Performing abuse check shutdown...');
            shutdownAbuseCheck();
            console.log('Abuse check shutdown complete.');
            console.log('Performing PDF Puppeteer shutdown...');
            await closePdfPuppeteer();
            console.log('PDF Puppeteer shutdown complete.');
        }
        catch (error) {
            console.error('Error during server shutdown:', error);
        }
        finally {
            console.log('Server shutdown process completed.');
            done();
        }
    }, {
        timeout: millisecondsInOneMinute
    });
    await it(`Ensure server starts on port ${portNumber.toString()}`, () => {
        assert.ok(serverStarted);
    });
    await it('Should run Cypress tests in Chrome', {
        timeout: cypressTimeoutMillis
    }, (_context, done) => {
        runCypress('chrome', done);
    });
    if (continueNextRun) {
        await it('Should run Cypress tests in Firefox', {
            timeout: cypressTimeoutMillis
        }, (_context, done) => {
            runCypress('firefox', done);
        });
    }
});

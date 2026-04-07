import assert from 'node:assert';
import { exec } from 'node:child_process';
import http from 'node:http';
import { after, before, describe, it } from 'node:test';
import { millisecondsInOneHour, millisecondsInOneMinute, minutesToMillis } from '@cityssm/to-millis';
import { app, shutdownAbuseCheck } from '../app/app.js';
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
    let cypressCommand = `cypress run --config-file cypress.config.js --browser ${browser}`;
    if ((process.env.CYPRESS_USE_LONGER_TIMEOUTS ?? '') === 'true') {
        cypressCommand += ' --expose useLongerTimeouts=true';
    }
    if ((process.env.CYPRESS_RECORD_KEY ?? '') !== '' &&
        process.version.startsWith(versionToRecord)) {
        cypressCommand += ` --tag "${browser},${process.version},${process.platform}" --record`;
    }
    const childProcess = exec(cypressCommand, {
        env: process.env,
        timeout: cypressTimeoutMillis
    });
    childProcess.stdout?.on('data', (data) => {
        console.log(data);
    });
    childProcess.stderr?.on('data', (data) => {
        console.error(data);
    });
    childProcess.on('error', (error) => {
        continueNextRun = false;
        finish(error instanceof Error ? error : new Error(String(error)));
    });
    childProcess.on('close', (code, signal) => {
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
    after((_context, done) => {
        try {
            console.log('Shutting down server...');
            httpServer.close(() => {
                console.error('Server closed to new connections.');
            });
            httpServer.closeAllConnections();
            console.log('Server shutdown completed successfully.');
            console.log('Performing abuse check shutdown...');
            shutdownAbuseCheck();
            console.log('Abuse check shutdown complete.');
        }
        catch (error) {
            console.error('Error during server shutdown:', error);
        }
        finally {
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

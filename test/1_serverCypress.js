/* eslint-disable unicorn/filename-case, @eslint-community/eslint-comments/disable-enable-pair */
import assert from 'node:assert';
import { exec } from 'node:child_process';
import http from 'node:http';
import { minutesToMillis } from '@cityssm/to-millis';
import { app } from '../app.js';
import { portNumber } from './_globals.js';
function runCypress(browser, done) {
    let cypressCommand = `cypress run --config-file cypress.config.js --browser ${browser}`;
    if ((process.env.CYPRESS_RECORD_KEY ?? '') !== '') {
        cypressCommand += ` --tag "${browser},${process.version}" --record`;
    }
    // eslint-disable-next-line security/detect-child-process, sonarjs/os-command
    const childProcess = exec(cypressCommand);
    childProcess.stdout?.on('data', (data) => {
        console.log(data);
    });
    childProcess.stderr?.on('data', (data) => {
        console.error(data);
    });
    childProcess.on('exit', (code) => {
        assert.ok(code === 0);
        done();
    });
}
describe('sunrise-cms', () => {
    const httpServer = http.createServer(app);
    let serverStarted = false;
    before(() => {
        httpServer.listen(portNumber);
        httpServer.on('listening', () => {
            serverStarted = true;
        });
    });
    after(() => {
        try {
            httpServer.close();
        }
        catch {
            // ignore
        }
    });
    it(`Ensure server starts on port ${portNumber.toString()}`, () => {
        assert.ok(serverStarted);
    });
    describe('Cypress tests', () => {
        it('Should run Cypress tests in Chrome', (done) => {
            runCypress('chrome', done);
        }).timeout(minutesToMillis(30));
        it('Should run Cypress tests in Firefox', (done) => {
            runCypress('firefox', done);
        }).timeout(minutesToMillis(30));
    });
});

import * as assert from "assert";
import { portNumber } from "./_globals.js";
import { exec } from "child_process";
import * as http from "http";
import { app } from "../app.js";
describe("lot-occupancy-system", () => {
    const httpServer = http.createServer(app);
    let serverStarted = false;
    before(() => {
        httpServer.listen(portNumber);
        httpServer.on("listening", () => {
            serverStarted = true;
        });
    });
    after(() => {
        try {
            httpServer.close();
        }
        catch (_a) {
        }
    });
    it("Ensure server starts on port " + portNumber.toString(), () => {
        assert.ok(serverStarted);
    });
    describe("Cypress tests", () => {
        it("should run Cypress tests", (done) => {
            let cypressCommand = "cypress run --config-file cypress.config.ts --browser chrome";
            if (process.env.CYPRESS_RECORD_KEY &&
                process.env.CYPRESS_RECORD_KEY !== "") {
                cypressCommand += " --record";
            }
            const childProcess = exec(cypressCommand);
            childProcess.stdout.on("data", (data) => {
                console.log(data);
            });
            childProcess.stderr.on("data", (data) => {
                console.error(data);
            });
            childProcess.on("exit", (code) => {
                assert.ok(code === 0);
                done();
            });
        }).timeout(30 * 60 * 60 * 1000);
    });
});

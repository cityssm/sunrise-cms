import cluster from 'node:cluster';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ntfyPublish from '@cityssm/ntfy-publish';
import { secondsToMillis } from '@cityssm/to-millis';
import Debug from 'debug';
import exitHook from 'exit-hook';
import { initializeDatabase } from '../database/initializeDatabase.js';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import version from '../version.js';
const debug = Debug(`${DEBUG_NAMESPACE}:www:${process.pid}`);
// INITIALIZE THE DATABASE
initializeDatabase();
const directoryName = path.dirname(fileURLToPath(import.meta.url));
const processCount = Math.min(getConfigProperty('application.maximumProcesses'), os.cpus().length * 2);
const applicationName = getConfigProperty('application.applicationName');
process.title = `${applicationName} (Primary)`;
debug(`Primary pid:   ${process.pid}`);
debug(`Primary title: ${process.title}`);
debug(`Version:       ${version}`);
debug(`Launching ${processCount} processes`);
const clusterSettings = {
    exec: `${directoryName}/wwwProcess.js`
};
cluster.setupPrimary(clusterSettings);
let doShutdown = false;
const activeWorkers = new Map();
for (let index = 0; index < processCount; index += 1) {
    const worker = cluster.fork();
    activeWorkers.set(worker.process.pid ?? 0, worker);
}
cluster.on('message', (worker, message) => {
    for (const [pid, activeWorker] of activeWorkers.entries()) {
        // eslint-disable-next-line sonarjs/different-types-comparison, @typescript-eslint/no-unnecessary-condition
        if (activeWorker === undefined || pid === message.pid) {
            continue;
        }
        debug(`Relaying message to worker: ${pid}`);
        activeWorker.send(message);
    }
});
cluster.on('exit', (worker) => {
    debug(`Worker ${(worker.process.pid ?? 0).toString()} has been killed`);
    activeWorkers.delete(worker.process.pid ?? 0);
    if (!doShutdown) {
        debug('Starting another worker');
        const newWorker = cluster.fork();
        activeWorkers.set(newWorker.process.pid ?? 0, newWorker);
    }
});
const ntfyStartupConfig = getConfigProperty('application.ntfyStartup');
if (ntfyStartupConfig !== undefined) {
    const topic = ntfyStartupConfig.topic;
    const server = ntfyStartupConfig.server;
    const ntfyStartupMessage = {
        message: 'Application Started',
        tags: ['arrow_up'],
        title: applicationName,
        topic
    };
    const ntfyShutdownMessage = {
        message: 'Application Shut Down',
        tags: ['arrow_down'],
        title: applicationName,
        topic
    };
    if (server !== undefined) {
        ntfyStartupMessage.server = server;
        ntfyShutdownMessage.server = server;
    }
    await ntfyPublish(ntfyStartupMessage);
    exitHook(() => {
        debug('Sending ntfy notification');
        void ntfyPublish(ntfyShutdownMessage);
    });
}
if (process.env.STARTUP_TEST === 'true') {
    const killSeconds = 10;
    debug(`Killing processes in ${killSeconds} seconds...`);
    setTimeout(() => {
        debug('Killing processes');
        doShutdown = true;
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(0);
    }, secondsToMillis(killSeconds));
}
exitHook(() => {
    doShutdown = true;
    debug('Shutting down...');
    for (const worker of activeWorkers.values()) {
        debug(`Killing worker ${worker.process.pid}`);
        worker.kill();
    }
});

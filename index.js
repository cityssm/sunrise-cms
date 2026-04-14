import { fork } from 'node:child_process';
import cluster from 'node:cluster';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { millisecondsInOneMinute, minutesToMillis, secondsToMillis } from '@cityssm/to-millis';
import Debug from 'debug';
import exitHook, { asyncExitHook, gracefulExit } from 'exit-hook';
import { initializeDatabase } from './database/initializeDatabase.js';
import { DEBUG_ENABLE_NAMESPACES, DEBUG_NAMESPACE } from './debug.config.js';
import { getConfigProperty } from './helpers/config.helpers.js';
import { ntfyIsEnabled, sendShutdownNotification, sendStartupNotification } from './integrations/ntfy/helpers.js';
import packageJson from './package.json' with { type: 'json' };
if (process.env.NODE_ENV === 'development') {
    Debug.enable(DEBUG_ENABLE_NAMESPACES);
}
const debug = Debug(`${DEBUG_NAMESPACE}:index`);
let doShutdown = false;
function initializeCluster() {
    const directoryName = path.dirname(fileURLToPath(import.meta.url));
    const processCount = Math.min(getConfigProperty('application.maximumProcesses'), os.cpus().length * 2);
    const applicationName = getConfigProperty('application.applicationName');
    process.title = `${applicationName} (Primary)`;
    debug(`Primary pid:   ${process.pid}`);
    debug(`Primary title: ${process.title}`);
    debug(`Version:       ${packageJson.version}`);
    debug(`Launching ${processCount} processes`);
    const clusterSettings = {
        exec: `${directoryName}/app/appProcess.js`
    };
    cluster.setupPrimary(clusterSettings);
    const activeWorkers = new Map();
    for (let index = 0; index < processCount; index += 1) {
        const worker = cluster.fork();
        const pid = worker.process.pid;
        if (pid === undefined) {
            debug('Forked worker without a valid PID; not adding to activeWorkers map');
            continue;
        }
        activeWorkers.set(pid, worker);
    }
    cluster.on('message', (worker, message) => {
        for (const [pid, activeWorker] of activeWorkers.entries()) {
            if (pid === message.pid) {
                continue;
            }
            debug(`Relaying message to worker: ${pid}`);
            activeWorker.send(message);
        }
    });
    cluster.on('exit', (worker) => {
        const pid = worker.process.pid;
        if (pid === undefined) {
            debug('Worker with unknown PID has been killed; cannot update activeWorkers map');
        }
        else {
            debug(`Worker ${pid.toString()} has been killed`);
            activeWorkers.delete(pid);
        }
        if (!doShutdown) {
            debug('Starting another worker');
            const newWorker = cluster.fork();
            const newPid = newWorker.process.pid;
            if (newPid === undefined) {
                debug('Forked replacement worker without a valid PID; not adding to activeWorkers map');
                return;
            }
            activeWorkers.set(newPid, newWorker);
        }
    });
    exitHook(() => {
        doShutdown = true;
        debug('Shutting down cluster workers...');
        for (const worker of activeWorkers.values()) {
            const pid = worker.process.pid;
            debug(pid === undefined
                ? 'Killing worker with unknown PID'
                : `Killing worker ${pid}`);
            worker.kill();
        }
    });
}
async function startApplication() {
    initializeDatabase();
    fork('./tasks/puppeteerSetup.task.js', {
        timeout: minutesToMillis(15)
    });
    if (ntfyIsEnabled) {
        await sendStartupNotification();
        asyncExitHook(async () => {
            await sendShutdownNotification();
        }, {
            wait: millisecondsInOneMinute
        });
    }
    const childProcesses = [];
    if (getConfigProperty('integrations.consignoCloud.integrationIsEnabled')) {
        childProcesses.push(fork(path.join('integrations', 'consignoCloud', 'updateWorkflows.task.js')));
    }
    if (getConfigProperty('settings.databaseBackup.taskIsEnabled')) {
        childProcesses.push(fork(path.join('tasks', 'backupDatabase.task.js')));
    }
    if (childProcesses.length > 0) {
        exitHook(() => {
            for (const childProcess of childProcesses) {
                const pid = childProcess.pid;
                debug(pid === undefined
                    ? 'Killing child process with unknown pid'
                    : `Killing child process ${pid}`);
                childProcess.kill();
            }
        });
    }
    initializeCluster();
}
await startApplication();
if (process.env.STARTUP_TEST === 'true') {
    const killSeconds = 10;
    debug(`Killing processes in ${killSeconds} seconds...`);
    setTimeout(() => {
        debug('Killing processes');
        doShutdown = true;
        gracefulExit(0);
    }, secondsToMillis(killSeconds));
}
function handleSignal(signal) {
    debug(`Received signal: ${signal}`);
    debug('Shutting down...');
    doShutdown = true;
    gracefulExit();
}
process.on('SIGINT', handleSignal);
process.on('SIGTERM', handleSignal);
process.on('SIGUSR2', handleSignal);

import http from 'node:http';
import Debug from 'debug';
import exitHook, { gracefulExit } from 'exit-hook';
import { app } from '../app.js';
import { DEBUG_NAMESPACE, PROCESS_ID_MAX_DIGITS } from '../debug.config.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { initializeApplication, isPrimaryProcess } from '../helpers/startup.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:wwwProcess:${process.pid.toString().padEnd(PROCESS_ID_MAX_DIGITS)}`);
if (isPrimaryProcess()) {
    // INITIALIZE THE APPLICATION
    await initializeApplication();
}
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES': {
            debug('Requires elevated privileges');
            gracefulExit(1);
            // break;
        }
        // eslint-disable-next-line no-fallthrough
        case 'EADDRINUSE': {
            debug('Port is already in use.');
            gracefulExit(1);
            // break;
        }
        // eslint-disable-next-line no-fallthrough
        default: {
            throw error;
        }
    }
}
function onListening(server) {
    const addr = server.address();
    if (addr !== null) {
        const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port.toString()}`;
        debug(`HTTP Listening on ${bind}`);
    }
}
/*
 * Initialize HTTP
 */
process.title = `${getConfigProperty('application.applicationName')} (Worker)`;
const httpPort = getConfigProperty('application.httpPort');
const httpServer = http.createServer(app);
httpServer
    .listen(httpPort)
    .on('error', onError)
    .on('listening', () => {
    onListening(httpServer);
});
exitHook(() => {
    debug('Closing HTTP');
    httpServer.close();
});

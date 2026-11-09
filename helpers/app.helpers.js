import os from 'node:os';
import { debuglog } from 'node:util';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from './config.helpers.js';
const debug = debuglog(`${DEBUG_NAMESPACE}:helpers:app`);
let appUrl = getConfigProperty('application.appUrl');
function getServerIp() {
    const interfaces = os.networkInterfaces();
    for (const networkInterface of Object.values(interfaces)) {
        if (networkInterface === undefined) {
            continue;
        }
        for (const iface of networkInterface) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}
export function getAppUrl() {
    if (appUrl === undefined || appUrl === '') {
        debug('App URL is not set, constructing from server IP and configuration.');
        appUrl = `http://${getServerIp()}${getConfigProperty('application.httpPort') === 80
            ? ''
            : `:${getConfigProperty('application.httpPort')}`}${getConfigProperty('reverseProxy.urlPrefix')}`;
    }
    return appUrl;
}

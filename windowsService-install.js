/* eslint-disable unicorn/filename-case */
import { Service } from 'node-windows';
import { serviceConfig } from './windowsService.js';
// Create a new service object
const svc = new Service(serviceConfig);
// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', () => {
    svc.start();
});
svc.install();

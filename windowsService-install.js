import { Service } from 'node-windows';
import { serviceConfig } from './windowsService.js';
const svc = new Service(serviceConfig);
svc.on('install', () => {
    svc.start();
});
svc.install();

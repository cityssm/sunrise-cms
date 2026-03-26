import { Service } from 'node-windows';
import { serviceConfig } from './windowsService.js';
const svc = new Service(serviceConfig);
svc.on('uninstall', () => {
    console.log('Uninstall complete.');
    console.log('The service exists:', svc.exists);
});
svc.uninstall();

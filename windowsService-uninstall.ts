/* eslint-disable no-console, unicorn/filename-case, @eslint-community/eslint-comments/disable-enable-pair */

import { Service } from 'node-windows'

import { serviceConfig } from './windowsService.js'

// Create a new service object
const svc = new Service(serviceConfig)

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', () => {
  console.log('Uninstall complete.')
  console.log('The service exists:', svc.exists)
})

// Uninstall the service.
svc.uninstall()

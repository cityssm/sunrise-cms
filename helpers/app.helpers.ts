import os from 'node:os'
import { debuglog } from 'node:util'

import { DEBUG_NAMESPACE } from '../debug.config.js'

import { getConfigProperty } from './config.helpers.js'

const debug = debuglog(`${DEBUG_NAMESPACE}:helpers:app`)

let appUrl = getConfigProperty('application.appUrl')

function getServerIp(): string {
  const interfaces = os.networkInterfaces()

  for (const networkInterface of Object.values(interfaces)) {
    if (networkInterface === undefined) {
      continue
    }

    for (const iface of networkInterface) {
      // Skip over internal (i.e. 127.0.0.1) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }

  return '127.0.0.1'
}

/**
 * Get the application URL, including the reverse proxy URL prefix if set.
 * @returns The application URL
 */
export function getAppUrl(): string {
  if (appUrl === undefined || appUrl === '') {
    debug('App URL is not set, constructing from server IP and configuration.')

    // eslint-disable-next-line unicorn/no-top-level-assignment-in-function
    appUrl = `http://${getServerIp()}${
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      getConfigProperty('application.httpPort') === 80
        ? ''
        : `:${getConfigProperty('application.httpPort')}`
    }${getConfigProperty('reverseProxy.urlPrefix')}`
  }

  return appUrl
}

import { fork } from 'node:child_process'

import { minutesToMillis } from '@cityssm/to-millis'
import type { Request } from 'express'

import { initializeDatabase } from '../database/initializeDatabase.js'

import { getConfigProperty } from './config.helpers.js'

export function initializeApplication(): void {
  initializeDatabase()

  fork('./tasks/puppeteerSetup.task.js', {
    timeout: minutesToMillis(15)
  })
}

let applicationUrl = getConfigProperty('application.applicationUrl')

/**
 * Get the application URL, including the reverse proxy URL prefix if set.
 * @param request The request object
 * @returns The application URL
 */
export function getApplicationUrl(request: Request): string {
  if (applicationUrl === undefined || applicationUrl === '') {
    applicationUrl = `http://${request.hostname}${
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      getConfigProperty('application.httpPort') === 80
        ? ''
        : `:${getConfigProperty('application.httpPort')}`
    }${getConfigProperty('reverseProxy.urlPrefix')}`
  }

  return applicationUrl
}

import type { Request } from 'express'

import { getConfigProperty } from './config.helpers.js'

let appUrl = getConfigProperty('application.appUrl')

/**
 * Get the application URL, including the reverse proxy URL prefix if set.
 * @param request - The request object
 * @returns The application URL
 */
export function getAppUrl(request: Request): string {
  if (appUrl === undefined || appUrl === '') {
    // eslint-disable-next-line unicorn/no-top-level-assignment-in-function
    appUrl = `http://${request.hostname}${
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      getConfigProperty('application.httpPort') === 80
        ? ''
        : `:${getConfigProperty('application.httpPort')}`
    }${getConfigProperty('reverseProxy.urlPrefix')}`
  }

  return appUrl
}

import {
  type BaseAuthenticator,
  ActiveDirectoryAuthenticator,
  ADWebAuthAuthenticator,
  FunctionAuthenticator,
  PlainTextAuthenticator
} from '@cityssm/authentication-helper'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../debug.config.js'
import authenticateLocalUser from '../database/authenticateLocalUser.js'

import { getConfigProperty } from './config.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:helpers:authentication`)

let authenticator: BaseAuthenticator | undefined

const authenticationConfig = getConfigProperty('login.authentication')

const domain = getConfigProperty('login.domain')

if (authenticationConfig === undefined) {
  debug('`login.authentication` not defined.')
} else {
  switch (authenticationConfig.type) {
    case 'activeDirectory': {
      authenticator = new ActiveDirectoryAuthenticator(
        authenticationConfig.config
      )
      break
    }
    case 'adWebAuth': {
      authenticator = new ADWebAuthAuthenticator(authenticationConfig.config)
      break
    }
    case 'function': {
      authenticator = new FunctionAuthenticator(authenticationConfig.config)
      break
    }
    case 'plainText': {
      debug('WARNING: Using plain text authentication.')
      authenticator = new PlainTextAuthenticator(authenticationConfig.config)
      break
    }
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    default: {
      debug("Unknown 'login.authentication' type")
    }
  }
}

export async function authenticate(
  userName: string | undefined,
  password: string | undefined
): Promise<boolean> {
  if ((userName ?? '') === '' || (password ?? '') === '') {
    return false
  }

  // First try local user authentication
  if (authenticateLocalUser(userName!, password!)) {
    return true
  }

  // Fallback to external authenticator
  if (authenticator === undefined) {
    return false
  }

  return await authenticator.authenticate(
    `${domain}\\${userName}`,
    password ?? ''
  )
}

/* eslint-disable @cspell/spellchecker */

const safeRedirects = new Set([
  '/admin/burialsitetypes',
  '/admin/cleanup',
  '/admin/contracttypes',
  '/admin/fees',
  '/admin/settings',
  '/admin/tables',
  '/burialsites',
  '/burialsites/new',
  '/cemeteries',
  '/cemeteries/new',
  '/contracts',
  '/contracts/new',
  '/dashboard',
  '/dashboard/updatelog',
  '/reports',
  '/workorders',
  '/workorders/milestonecalendar',
  '/workorders/new',
  '/workorders/outlook',
  '/workorders/workday'
])

/* eslint-enable @cspell/spellchecker */

const recordUrl =
  /^\/(?:cemeteries|burialsites|contracts|workorders)\/\d+(?:\/edit)?$/

const printUrl = /^\/print\/(?:pdf|screen)\/[\d/=?A-Za-z-]+$/

export function getSafeRedirectURL(possibleRedirectURL = ''): string {
  const urlPrefix = getConfigProperty('reverseProxy.urlPrefix')

  if (typeof possibleRedirectURL === 'string') {
    const urlToCheck = possibleRedirectURL.startsWith(urlPrefix)
      ? possibleRedirectURL.slice(urlPrefix.length)
      : possibleRedirectURL

    const urlToCheckLowerCase = urlToCheck.toLowerCase()

    if (
      safeRedirects.has(urlToCheckLowerCase) ||
      recordUrl.test(urlToCheckLowerCase) ||
      printUrl.test(urlToCheck)
    ) {
      return urlPrefix + urlToCheck
    }
  }

  return `${urlPrefix}/dashboard/`
}

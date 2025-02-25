import ActiveDirectory from 'activedirectory2'

import { getConfigProperty } from './config.helpers.js'

const userDomain = getConfigProperty('application.userDomain')

const activeDirectoryConfig = getConfigProperty('activeDirectory')

async function authenticateViaActiveDirectory(
  userName: string,
  password: string
): Promise<boolean> {
  return await new Promise((resolve) => {
    try {
      const ad = new ActiveDirectory(activeDirectoryConfig)

      ad.authenticate(`${userDomain}\\${userName}`, password, (error, auth) => {
        let authenticated = false

        if ((error ?? '') === '') {
          authenticated = auth
        }

        resolve(authenticated)
      })
    } catch {
      resolve(false)
    }
  })
}

export async function authenticate(
  userName: string | undefined,
  password: string | undefined
): Promise<boolean> {
  if ((userName ?? '') === '' || (password ?? '') === '') {
    return false
  }

  return await authenticateViaActiveDirectory(userName ?? '', password ?? '')
}

/* eslint-disable @cspell/spellchecker */

const safeRedirects = new Set([
  '/admin/cleanup',
  '/admin/fees',
  '/admin/burialsitetypes',
  '/admin/contracttypes',
  '/admin/tables',
  '/contracts',
  '/contracts/new',
  '/burialSites',
  '/burialSites/new',
  '/cemeteries',
  '/cemeteries/new',
  '/workorders',
  '/workorders/new',
  '/workorders/milestonecalendar',
  '/workorders/outlook',
  '/reports'
])

/* eslint-enable @cspell/spellchecker */

const recordUrl = /^\/(?:cemeteries|burialSites|contracts|workorders)\/\d+(?:\/edit)?$/

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

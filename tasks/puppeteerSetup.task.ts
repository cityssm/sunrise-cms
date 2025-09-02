import { testInstalledBrowser } from '@cityssm/pdf-puppeteer'
import Debug from 'debug'

import { DEBUG_ENABLE_NAMESPACES, DEBUG_NAMESPACE } from '../debug.config.js'
import { getConfigProperty } from '../helpers/config.helpers.js'

if (process.env.NODE_ENV === 'development') {
  Debug.enable(DEBUG_ENABLE_NAMESPACES)
}

const debug = Debug(`${DEBUG_NAMESPACE}:puppeteerSetup`)

const browser = getConfigProperty('settings.printPdf.browser')

debug('Testing browser: %o', browser)

const result = await testInstalledBrowser(browser, true)

debug('Browser test result: %o', result)

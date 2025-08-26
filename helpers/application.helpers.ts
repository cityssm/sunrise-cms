import { testInstalledBrowser } from '@cityssm/pdf-puppeteer'

import { initializeDatabase } from '../database/initializeDatabase.js'

import { getConfigProperty } from './config.helpers.js'

export async function initializeApplication(): Promise<void> {
  initializeDatabase()

  await testInstalledBrowser(getConfigProperty('settings.printPdf.browser'), true)
}

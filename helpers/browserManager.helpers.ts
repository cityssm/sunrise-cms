import {
  installChromeBrowser,
  installFirefoxBrowser,
  puppeteer
} from '@cityssm/puppeteer-launch'
import PdfPuppeteer from '@cityssm/pdf-puppeteer'
import Debug from 'debug'

import { getConfigProperty } from './config.helpers.js'
import { getCachedSettingValue } from './cache/settings.cache.js'
import updateSetting from '../database/updateSetting.js'
import { DEBUG_NAMESPACE } from '../debug.config.js'

const debug = Debug(`${DEBUG_NAMESPACE}:helpers:browserManager`)

type Browser = puppeteer.SupportedBrowser

export interface BrowserInstallationResult {
  success: boolean
  browser: Browser
  error?: Error
  message?: string
}

export interface BrowserValidationResult {
  isAvailable: boolean
  browser: Browser
  error?: Error
}

/**
 * Attempts to install a specific browser with retry logic
 */
export async function installBrowserWithRetry(
  browser: Browser,
  maxRetries: number = 3
): Promise<BrowserInstallationResult> {
  debug(`Installing ${browser} browser (max retries: ${maxRetries})`)
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      debug(`${browser} installation attempt ${attempt}/${maxRetries}`)
      
      if (browser === 'chrome') {
        await installChromeBrowser()
      } else if (browser === 'firefox') {
        await installFirefoxBrowser()
      } else {
        throw new Error(`Unsupported browser: ${browser}`)
      }
      
      debug(`${browser} browser installation successful on attempt ${attempt}`)
      return {
        success: true,
        browser,
        message: `${browser} browser installed successfully on attempt ${attempt}`
      }
    } catch (error) {
      debug(`${browser} installation attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries) {
        debug(`${browser} installation failed after ${maxRetries} attempts`)
        return {
          success: false,
          browser,
          error: error as Error,
          message: `Failed to install ${browser} browser after ${maxRetries} attempts`
        }
      }
      
      // Wait before retrying (exponential backoff)
      const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
      debug(`Waiting ${delayMs}ms before retry...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  
  return {
    success: false,
    browser,
    error: new Error('Unexpected end of retry loop'),
    message: `Unexpected failure installing ${browser} browser`
  }
}

/**
 * Attempts to validate that a browser is available
 */
export async function validateBrowserAvailability(
  browser: Browser
): Promise<BrowserValidationResult> {
  debug(`Validating ${browser} browser availability`)
  
  try {
    // Import PdfPuppeteer dynamically to avoid early initialization
    const { default: PdfPuppeteer } = await import('@cityssm/pdf-puppeteer')
    
    const testPuppeteer = new PdfPuppeteer({
      browser
    })
    
    // Try to generate a minimal PDF to test browser availability
    const testHtml = '<html><body><h1>Browser Test</h1></body></html>'
    await testPuppeteer.fromHtml(testHtml)
    await testPuppeteer.closeBrowser()
    
    debug(`${browser} browser validation successful`)
    return {
      isAvailable: true,
      browser
    }
  } catch (error) {
    debug(`${browser} browser validation failed:`, error)
    return {
      isAvailable: false,
      browser,
      error: error as Error
    }
  }
}

/**
 * Installs and validates browsers based on configuration
 */
export async function ensureBrowsersAvailable(): Promise<{
  success: boolean
  results: BrowserInstallationResult[]
  validatedBrowser?: Browser
}> {
  debug('Ensuring browsers are available')
  
  const preferredBrowser = getConfigProperty('settings.printPdf.browser')
  const maxRetries = getConfigProperty('settings.printPdf.maxRetries', 3)
  const installBothBrowsers = getConfigProperty('settings.printPdf.installBothBrowsers', true)
  
  const results: BrowserInstallationResult[] = []
  
  // Determine which browsers to install
  const browsersToInstall: Browser[] = installBothBrowsers 
    ? ['chrome', 'firefox']
    : [preferredBrowser]
  
  // Install browsers
  for (const browser of browsersToInstall) {
    const result = await installBrowserWithRetry(browser, maxRetries)
    results.push(result)
    
    if (!result.success) {
      debug(`Failed to install ${browser}:`, result.error?.message)
    }
  }
  
  // Validate at least one browser is available
  let validatedBrowser: Browser | undefined
  
  // Try preferred browser first
  if (results.find(r => r.browser === preferredBrowser && r.success)) {
    const validation = await validateBrowserAvailability(preferredBrowser)
    if (validation.isAvailable) {
      validatedBrowser = preferredBrowser
    }
  }
  
  // If preferred browser not available, try others
  if (!validatedBrowser) {
    for (const result of results) {
      if (result.success) {
        const validation = await validateBrowserAvailability(result.browser)
        if (validation.isAvailable) {
          validatedBrowser = result.browser
          break
        }
      }
    }
  }
  
  const success = validatedBrowser !== undefined
  
  if (success) {
    debug(`Browser availability ensured. Using: ${validatedBrowser}`)
    
    // Update settings to track successful installation
    updateSetting({
      settingKey: 'pdfPuppeteer.browserInstallAttempted',
      settingValue: 'true'
    })
    
    updateSetting({
      settingKey: 'pdfPuppeteer.lastSuccessfulBrowser',
      settingValue: validatedBrowser
    })
    
    updateSetting({
      settingKey: 'pdfPuppeteer.lastInstallationDate',
      settingValue: new Date().toISOString()
    })
  } else {
    debug('Failed to ensure browser availability')
  }
  
  return {
    success,
    results,
    validatedBrowser
  }
}

/**
 * Gets the best available browser for PDF generation
 */
export async function getBestAvailableBrowser(): Promise<Browser | null> {
  const preferredBrowser = getConfigProperty('settings.printPdf.browser')
  const lastSuccessfulBrowser = getCachedSettingValue('pdfPuppeteer.lastSuccessfulBrowser') as Browser
  
  // Try browsers in order of preference
  const browsersToTry: Browser[] = [
    preferredBrowser,
    lastSuccessfulBrowser,
    'chrome',
    'firefox'
  ].filter((browser, index, array) => 
    browser && array.indexOf(browser) === index // Remove duplicates and falsy values
  ) as Browser[]
  
  for (const browser of browsersToTry) {
    const validation = await validateBrowserAvailability(browser)
    if (validation.isAvailable) {
      debug(`Best available browser: ${browser}`)
      return browser
    }
  }
  
  debug('No browsers available')
  return null
}

/**
 * Checks if browser installation should be attempted based on settings
 */
export function shouldAttemptBrowserInstallation(): boolean {
  const lastAttempt = getCachedSettingValue('pdfPuppeteer.browserInstallAttempted')
  const forceReinstall = getConfigProperty('settings.printPdf.forceReinstallOnStartup', false)
  const installationDate = getCachedSettingValue('pdfPuppeteer.lastInstallationDate')
  const maxAgeDays = getConfigProperty('settings.printPdf.reinstallAfterDays', 30)
  
  if (forceReinstall) {
    debug('Force reinstall enabled')
    return true
  }
  
  if (lastAttempt !== 'true') {
    debug('Browser installation never attempted')
    return true
  }
  
  if (installationDate) {
    const lastInstall = new Date(installationDate)
    const daysSinceInstall = (Date.now() - lastInstall.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceInstall > maxAgeDays) {
      debug(`Browser installation is ${daysSinceInstall.toFixed(1)} days old, reinstalling`)
      return true
    }
  }
  
  debug('Browser installation not needed')
  return false
}
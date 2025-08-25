import PdfPuppeteer, {
  installChromeBrowser,
  installFirefoxBrowser
} from '@cityssm/pdf-puppeteer'
import { puppeteer } from '@cityssm/puppeteer-launch'
import Debug from 'debug'
import { renderFile as renderEjsFile } from 'ejs'
import exitHook from 'exit-hook'

import updateSetting from '../database/updateSetting.js'
import { DEBUG_NAMESPACE } from '../debug.config.js'

import { getCachedSettingValue } from './cache/settings.cache.js'
import { type PrintConfigWithPath, getReportData } from './print.helpers.js'
import { getConfigProperty } from './config.helpers.js'
import { 
  getBestAvailableBrowser,
  ensureBrowsersAvailable,
  installBrowserWithRetry 
} from './browserManager.helpers.js'

type Browser = puppeteer.SupportedBrowser

const debug = Debug(`${DEBUG_NAMESPACE}:helpers:pdf`)

let pdfPuppeteer: PdfPuppeteer | undefined

/**
 * Get or create PDF Puppeteer instance with the best available browser
 */
async function getPdfPuppeteerInstance(): Promise<PdfPuppeteer> {
  if (pdfPuppeteer) {
    return pdfPuppeteer
  }

  const bestBrowser = await getBestAvailableBrowser()
  
  if (!bestBrowser) {
    debug('No browser available, attempting to install browsers')
    const installResult = await ensureBrowsersAvailable()
    
    if (!installResult.success || !installResult.validatedBrowser) {
      throw new Error('No browsers available and installation failed')
    }
    
    debug(`Using newly installed browser: ${installResult.validatedBrowser}`)
    pdfPuppeteer = new PdfPuppeteer({
      browser: installResult.validatedBrowser
    })
  } else {
    debug(`Using available browser: ${bestBrowser}`)
    pdfPuppeteer = new PdfPuppeteer({
      browser: bestBrowser
    })
  }

  return pdfPuppeteer
}

exitHook(async () => {
  if (pdfPuppeteer) {
    await pdfPuppeteer.closeBrowser()
  }
})

export async function generatePdf(
  printConfig: PrintConfigWithPath,
  parameters: Record<string, unknown>
): Promise<Uint8Array> {
  const reportData = await getReportData(printConfig, parameters)

  debug('Rendering:', printConfig.path)

  let renderedHtml = ''

  try {
    renderedHtml = await renderEjsFile(printConfig.path, reportData)
  } catch (error) {
    throw new Error(
      `Error rendering HTML for ${printConfig.title}: ${(error as Error).message}`
    )
  }

  const maxRetries = getConfigProperty('settings.printPdf.maxRetries', 3)
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      debug(`PDF generation attempt ${attempt}/${maxRetries} for ${printConfig.title}`)
      
      const puppeteerInstance = await getPdfPuppeteerInstance()
      const pdf = await puppeteerInstance.fromHtml(renderedHtml)
      
      debug(`PDF generated successfully for ${printConfig.title} on attempt ${attempt}`)
      return pdf
    } catch (pdfGenerationError) {
      lastError = pdfGenerationError as Error
      debug(`PDF generation attempt ${attempt} failed:`, lastError.message)

      // If this is not the last attempt, try browser recovery
      if (attempt < maxRetries) {
        try {
          await recoverFromPdfError(lastError, attempt)
        } catch (recoveryError) {
          debug('Browser recovery failed:', recoveryError)
          // Continue to next attempt
        }
      }
    }
  }

  // All attempts failed
  throw new Error(
    `Error generating PDF for ${printConfig.title} after ${maxRetries} attempts. Last error: ${lastError?.message ?? 'Unknown error'}`
  )
}

/**
 * Attempts to recover from PDF generation errors
 */
async function recoverFromPdfError(error: Error, attempt: number): Promise<void> {
  debug(`Attempting error recovery for attempt ${attempt}:`, error.message)

  // Close current instance to force recreation
  if (pdfPuppeteer) {
    try {
      await pdfPuppeteer.closeBrowser()
    } catch (closeError) {
      debug('Error closing browser during recovery:', closeError)
    }
    pdfPuppeteer = undefined
  }

  // If error suggests browser issues, try reinstalling
  const errorMessage = error.message.toLowerCase()
  if (
    errorMessage.includes('no fallback system browsers') ||
    errorMessage.includes('browser not found') ||
    errorMessage.includes('failed to launch') ||
    errorMessage.includes('target closed')
  ) {
    debug('Browser-related error detected, attempting browser installation')
    
    const browserInstallAttempted = getCachedSettingValue(
      'pdfPuppeteer.browserInstallAttempted'
    )

    // Always try installation if it's a browser error
    if (browserInstallAttempted !== 'true' || attempt > 1) {
      debug('Installing browsers for error recovery')
      const installResult = await ensureBrowsersAvailable()
      
      if (installResult.success) {
        debug('Browser installation successful during recovery')
        updateSetting({
          settingKey: 'pdfPuppeteer.browserInstallAttempted',
          settingValue: 'true'
        })
      } else {
        debug('Browser installation failed during recovery')
        throw new Error('Failed to install browsers during error recovery')
      }
    }
  }

  // Wait before retry (exponential backoff)
  const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
  debug(`Waiting ${delayMs}ms before retry...`)
  await new Promise(resolve => setTimeout(resolve, delayMs))
}

export async function closePdfPuppeteer(): Promise<void> {
  if (pdfPuppeteer) {
    await pdfPuppeteer.closeBrowser()
    pdfPuppeteer = undefined
  }
}

/**
 * Initialize browsers proactively during application startup
 */
export async function initializePdfBrowsers(): Promise<boolean> {
  debug('Initializing PDF browsers during startup')
  
  const proactiveInstallation = getConfigProperty('settings.printPdf.proactiveInstallation', true)
  
  if (!proactiveInstallation) {
    debug('Proactive browser installation disabled')
    return true
  }

  try {
    const installResult = await ensureBrowsersAvailable()
    
    if (installResult.success) {
      debug('PDF browsers initialized successfully')
      return true
    } else {
      debug('PDF browser initialization failed, but continuing startup')
      // Log the errors but don't fail startup
      for (const result of installResult.results) {
        if (!result.success) {
          debug(`Browser installation failed: ${result.browser} - ${result.message}`)
        }
      }
      return false
    }
  } catch (error) {
    debug('Error during PDF browser initialization:', error)
    return false
  }
}

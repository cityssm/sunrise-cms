import PdfPuppeteer, {
  installChromeBrowser,
  installFirefoxBrowser
} from '@cityssm/pdf-puppeteer'
import { millisecondsInOneMinute } from '@cityssm/to-millis'
import Debug from 'debug'
import ejs from 'ejs'
import { asyncExitHook } from 'exit-hook'

import updateSetting from '../database/updateSetting.js'
import { DEBUG_NAMESPACE } from '../debug.config.js'

import { getCachedSettingValue } from './cache/settings.cache.js'
import { getConfigProperty } from './config.helpers.js'
import { type PrintConfigWithPath, getReportData } from './print.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:helpers:pdf`)

const pdfPuppeteer = new PdfPuppeteer({
  browser: getConfigProperty('settings.printPdf.browser'),
  disableSandbox: true
})

export async function generatePdf(
  printConfig: PrintConfigWithPath,
  parameters: Record<string, unknown>
): Promise<Uint8Array> {
  const reportData = await getReportData(printConfig, parameters)

  debug('Rendering:', printConfig.path)

  let renderedHtml: string

  try {
    renderedHtml = await ejs.renderFile(printConfig.path, reportData)
  } catch (error) {
    throw new Error(
      `Error rendering HTML for ${printConfig.title}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    )
  }

  try {
    const pdf = await pdfPuppeteer.fromHtml(renderedHtml)
    return pdf
  } catch (pdfGenerationError) {
    const browserInstallAttempted = getCachedSettingValue(
      'pdfPuppeteer.browserInstallAttempted'
    )

    if (browserInstallAttempted === 'false') {
      try {
        await installChromeBrowser()
        await installFirefoxBrowser()
      } catch (browserInstallError) {
        debug(
          'Error installing browsers:',
          browserInstallError instanceof Error
            ? browserInstallError.message
            : String(browserInstallError)
        )
      }

      updateSetting({
        settingKey: 'pdfPuppeteer.browserInstallAttempted',
        settingValue: 'true'
      })

      await pdfPuppeteer.closeBrowser()

      debug('PDF Puppeteer browser installation was attempted.')

      return await generatePdf(printConfig, parameters)
    }

    throw new Error(
      `Error generating PDF for ${printConfig.title}: ${pdfGenerationError instanceof Error ? pdfGenerationError.message : String(pdfGenerationError)}`,
      { cause: pdfGenerationError }
    )
  }
}

export async function closePdfPuppeteer(): Promise<void> {
  debug('Closing PDF Puppeteer browser...')
  await pdfPuppeteer.closeBrowser()
  debug('PDF Puppeteer browser closed.')
}

asyncExitHook(
  async () => {
    await closePdfPuppeteer()
  },
  {
    wait: millisecondsInOneMinute / 2
  }
)

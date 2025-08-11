import PdfPuppeteer from '@cityssm/pdf-puppeteer'
import Debug from 'debug'
import { renderFile as renderEjsFile } from 'ejs'
import exitHook from 'exit-hook'

import { DEBUG_NAMESPACE } from '../debug.config.js'

import { type PrintConfigWithPath, getReportData } from './print.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:helpers:pdf`)

const pdfPuppeteer = new PdfPuppeteer()

exitHook(() => {
  void pdfPuppeteer.closeBrowser()
})

export async function generatePdf(
  printConfig: PrintConfigWithPath,
  parameters: Record<string, unknown>
): Promise<Uint8Array> {
  const reportData = await getReportData(printConfig, parameters)

  debug('Rendering', printConfig.path)
  
  try {
    const renderedHtml = await renderEjsFile(printConfig.path, reportData)

    const pdf = await pdfPuppeteer.fromHtml(renderedHtml)

    return pdf
  } catch (error) {
    throw new Error(
      `Error generating PDF for ${printConfig.title}: ${error.message}`
    )
  }
}

import PdfPuppeteer from '@cityssm/pdf-puppeteer'
import camelcase from 'camelcase'
import { renderFile as renderEjsFile } from 'ejs'
import exitHook from 'exit-hook'
import type { NextFunction, Request, Response } from 'express'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import {
  getPdfPrintConfig,
  getReportData
} from '../../helpers/print.helpers.js'

const attachmentOrInline = getConfigProperty(
  'settings.printPdf.contentDisposition'
)

const pdfPuppeteer = new PdfPuppeteer()

exitHook(() => {
  void pdfPuppeteer.closeBrowser()
})

export async function handler(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  const printName = request.params.printName

  if (
    !getConfigProperty('settings.contracts.prints').includes(
      `pdf/${printName}`
    ) &&
    !getConfigProperty('settings.workOrders.prints').includes(
      `pdf/${printName}`
    )
  ) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/dashboard/?error=printConfigNotAllowed`
    )
    return
  }

  const printConfig = getPdfPrintConfig(printName)

  if (printConfig === undefined) {
    response.redirect(
      `${getConfigProperty('reverseProxy.urlPrefix')}/dashboard/?error=printConfigNotFound`
    )
    return
  }

  const reportData = await getReportData(printConfig, request.query)

  function pdfCallbackFunction(pdf: Buffer): void {
    let exportFileNameId = ''

    if ((printConfig?.params.length ?? 0) > 0) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
      exportFileNameId = `-${request.query[printConfig?.params[0] ?? '']}`
    }

    const exportFileName = `${camelcase(printConfig?.title ?? 'export')}${exportFileNameId}.pdf`

    response.setHeader(
      'Content-Disposition',
      `${attachmentOrInline}; filename=${exportFileName}`
    )

    response.setHeader('Content-Type', 'application/pdf')

    response.send(pdf)
  }

  async function ejsCallbackFunction(
    ejsError: Error | null,
    ejsData: string
  ): Promise<void> {
    // eslint-disable-next-line unicorn/no-null
    if (ejsError != null) {
      next(ejsError)
      return
    }

    const pdf = await pdfPuppeteer.fromHtml(ejsData)
    
    pdfCallbackFunction(Buffer.from(pdf))
  }

  await renderEjsFile(printConfig.path, reportData, {}, ejsCallbackFunction)
}

export default handler

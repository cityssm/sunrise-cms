import type { Request, Response } from 'express'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import {
  getReportData,
  getScreenPrintConfig
} from '../../helpers/print.helpers.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const printName = request.params.printName

  if (
    !getConfigProperty('settings.contracts.prints').includes(
      `screen/${printName}`
    ) &&
    !getConfigProperty('settings.workOrders.prints').includes(
      `screen/${printName}`
    )
  ) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/dashboard/?error=printConfigNotAllowed`
    )
    return
  }

  const printConfig = getScreenPrintConfig(printName)

  if (printConfig === undefined) {
    response.redirect(
      `${getConfigProperty('reverseProxy.urlPrefix')}/dashboard/?error=printConfigNotFound`
    )
    
    return
  }

  const reportData = await getReportData(printConfig, request.query)

  response.render(`print/screen/${printName}`, reportData)
}

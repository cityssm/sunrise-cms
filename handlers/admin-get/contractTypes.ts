import type { Request, Response } from 'express'

import { getConfigProperty } from '../../helpers/config.helpers.js'
import {
  getAllContractTypeFields,
  getContractTypes
} from '../../helpers/functions.cache.js'
import { getPrintConfig } from '../../helpers/functions.print.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const contractTypes = await getContractTypes()
  const allContractTypeFields = await getAllContractTypeFields()

  const contractTypePrints = getConfigProperty('settings.contracts.prints')

  const contractTypePrintTitles = {}

  for (const printEJS of contractTypePrints) {
    const printConfig = getPrintConfig(printEJS)

    if (printConfig !== undefined) {
      contractTypePrintTitles[printEJS] = printConfig.title
    }
  }

  response.render('admin-contractTypes', {
    headTitle: `Contract Type Management`,
    contractTypes,
    allContractTypeFields,
    contractTypePrintTitles
  })
}

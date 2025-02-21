import type { Request, Response } from 'express'

import {
  getAllOccupancyTypeFields,
  getOccupancyTypes
} from '../../helpers/functions.cache.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { getPrintConfig } from '../../helpers/functions.print.js'

export default async function handler(
  _request: Request,
  response: Response
): Promise<void> {
  const occupancyTypes = await getOccupancyTypes()
  const allOccupancyTypeFields = await getAllOccupancyTypeFields()

  const occupancyTypePrints = getConfigProperty('settings.lotOccupancy.prints')

  const occupancyTypePrintTitles = {}

  for (const printEJS of occupancyTypePrints) {
    const printConfig = getPrintConfig(printEJS)

    if (printConfig !== undefined) {
      occupancyTypePrintTitles[printEJS] = printConfig.title
    }
  }

  response.render('admin-occupancyTypes', {
    headTitle: `${getConfigProperty('aliases.occupancy')} Type Management`,
    occupancyTypes,
    allOccupancyTypeFields,
    occupancyTypePrintTitles
  })
}

import type { Request, Response } from 'express'

import getCemeteries from '../../database/getCemeteries.js'
import getFuneralHomes from '../../database/getFuneralHomes.js';
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    unknown,
    { error?: string; workOrderOpenDateString?: string }
  >,
  response: Response
): void {
  let error = request.query.error

  if (error === 'workOrderIdNotFound') {
    error = 'Work Order ID not found.'
  } else if (error === 'workOrderNumberNotFound') {
    error = 'Work Order Number not found.'
  }

  const cemeteries = getCemeteries()
  const funeralHomes = getFuneralHomes()

  const workOrderTypes = getCachedWorkOrderTypes()

  response.render('workOrders/search', {
    headTitle: 'Work Order Search',

    cemeteries,
    funeralHomes,
    workOrderTypes,

    workOrderOpenDateString: request.query.workOrderOpenDateString ?? '',

    error
  })
}

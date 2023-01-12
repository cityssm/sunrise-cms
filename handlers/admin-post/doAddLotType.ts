import type { RequestHandler } from 'express'

import { addRecord } from '../../helpers/lotOccupancyDB/addRecord.js'
import { getLotTypes } from '../../helpers/functions.cache.js'

export const handler: RequestHandler = (request, response) => {
  const lotTypeId = addRecord(
    'LotTypes',
    request.body.lotType,
    request.body.orderNumber ?? -1,
    request.session
  )

  const lotTypes = getLotTypes()

  response.json({
    success: true,
    lotTypeId,
    lotTypes
  })
}

export default handler

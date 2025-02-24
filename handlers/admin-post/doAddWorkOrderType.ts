import type { Request, Response } from 'express'

import addRecord from '../../database/addRecord.js'
import { getWorkOrderTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderType: string; orderNumber?: number | string }
  >,
  response: Response
): Promise<void> {
  const workOrderTypeId = await addRecord(
    'WorkOrderTypes',
    request.body.workOrderType,
    request.body.orderNumber ?? -1,
    request.session.user as User
  )

  const workOrderTypes = await getWorkOrderTypes()

  response.json({
    success: true,
    workOrderTypeId,
    workOrderTypes
  })
}

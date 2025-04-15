import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getWorkOrderTypes } from '../../helpers/functions.cache.js'

export default async function handler(
  request: Request<unknown, unknown, { workOrderTypeId: string }>,
  response: Response
): Promise<void> {
  const success = await deleteRecord(
    'WorkOrderTypes',
    request.body.workOrderTypeId,
    request.session.user as User
  )

  const workOrderTypes = await getWorkOrderTypes()

  response.json({
    success,
    
    workOrderTypes
  })
}

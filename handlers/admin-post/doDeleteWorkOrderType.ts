import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getWorkOrderTypes } from '../../helpers/cache.helpers.js'

export default function handler(
  request: Request<unknown, unknown, { workOrderTypeId: string }>,
  response: Response
): void {
  const success = deleteRecord(
    'WorkOrderTypes',
    request.body.workOrderTypeId,
    request.session.user as User
  )

  const workOrderTypes = getWorkOrderTypes()

  response.json({
    success,

    workOrderTypes
  })
}

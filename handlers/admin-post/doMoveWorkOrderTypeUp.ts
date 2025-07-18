import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getWorkOrderTypes } from '../../helpers/cache.helpers.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderTypeId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordUpToTop('WorkOrderTypes', request.body.workOrderTypeId)
      : moveRecordUp('WorkOrderTypes', request.body.workOrderTypeId)

  const workOrderTypes = getWorkOrderTypes()

  response.json({
    success,
    workOrderTypes
  })
}

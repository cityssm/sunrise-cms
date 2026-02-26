import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'

import type { WorkOrderType } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoMoveWorkOrderTypeUpResponse =
  { success: boolean; workOrderTypes: WorkOrderType[] }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderTypeId: string; moveToEnd: '0' | '1' }
  >,
  response: Response<DoMoveWorkOrderTypeUpResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordUpToTop('WorkOrderTypes', request.body.workOrderTypeId)
      : moveRecordUp('WorkOrderTypes', request.body.workOrderTypeId)

  const workOrderTypes = getCachedWorkOrderTypes()

  response.json({
    success,
    workOrderTypes
  })
}

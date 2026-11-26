import type { Request, Response } from 'express'

import {
  moveRecordDown,
  moveRecordDownToBottom
} from '../../database/moveRecord.js'
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js'
import type { WorkOrderType } from '../../types/record.types.js'

export type DoMoveWorkOrderTypeDownResponse = {
  success: boolean
  workOrderTypes: WorkOrderType[]
}

export default function handler(
  request: Request<
    unknown,
    unknown,
    { moveToEnd: '0' | '1'; workOrderTypeId: string }
  >,
  response: Response<DoMoveWorkOrderTypeDownResponse>
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordDownToBottom('WorkOrderTypes', request.body.workOrderTypeId)
      : moveRecordDown('WorkOrderTypes', request.body.workOrderTypeId)

  const workOrderTypes = getCachedWorkOrderTypes()

  response.json({
    success,
    workOrderTypes
  })
}

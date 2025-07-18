import type { Request, Response } from 'express'

import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js'
import { getWorkOrderMilestoneTypes } from '../../helpers/cache.helpers.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderMilestoneTypeId: string; moveToEnd: '0' | '1' }
  >,
  response: Response
): void {
  const success =
    request.body.moveToEnd === '1'
      ? moveRecordUpToTop(
          'WorkOrderMilestoneTypes',
          request.body.workOrderMilestoneTypeId
        )
      : moveRecordUp(
          'WorkOrderMilestoneTypes',
          request.body.workOrderMilestoneTypeId
        )

  const workOrderMilestoneTypes = getWorkOrderMilestoneTypes()

  response.json({
    success,
    workOrderMilestoneTypes
  })
}

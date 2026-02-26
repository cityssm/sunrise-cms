import type { Request, Response } from 'express'

import { updateWorkOrderMilestoneType } from '../../database/updateRecord.js'
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js'

import type { WorkOrderMilestoneType } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoUpdateWorkOrderMilestoneTypeResponse =
  { success: boolean; workOrderMilestoneTypes: WorkOrderMilestoneType[] }

export default function handler(
  request: Request<
    unknown,
    unknown,
    { workOrderMilestoneTypeId: string; workOrderMilestoneType: string }
  >,
  response: Response<DoUpdateWorkOrderMilestoneTypeResponse>
): void {
  const success = updateWorkOrderMilestoneType(
    request.body.workOrderMilestoneTypeId,
    request.body.workOrderMilestoneType,
    request.session.user as User
  )

  const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes()

  response.json({
    success,
    workOrderMilestoneTypes
  })
}

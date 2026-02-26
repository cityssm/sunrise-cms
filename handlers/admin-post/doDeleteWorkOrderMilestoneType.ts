import type { Request, Response } from 'express'

import { deleteRecord } from '../../database/deleteRecord.js'
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js'

import type { WorkOrderMilestoneType } from '../../types/record.types.js'


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side
export type DoDeleteWorkOrderMilestoneTypeResponse =
  { success: boolean; workOrderMilestoneTypes: WorkOrderMilestoneType[] }

export default function handler(
  request: Request<unknown, unknown, { workOrderMilestoneTypeId: string }>,
  response: Response<DoDeleteWorkOrderMilestoneTypeResponse>
): void {
  const success = deleteRecord(
    'WorkOrderMilestoneTypes',
    request.body.workOrderMilestoneTypeId,
    request.session.user as User
  )

  const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes()

  response.json({
    success,

    workOrderMilestoneTypes
  })
}

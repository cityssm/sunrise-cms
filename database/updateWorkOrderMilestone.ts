import {
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'

import { acquireConnection } from './pool.js'

export interface UpdateWorkOrderMilestoneForm {
  workOrderMilestoneId: number | string

  workOrderMilestoneDateString: string
  workOrderMilestoneDescription: string
  workOrderMilestoneTimeString?: string
  workOrderMilestoneTypeId: number | string
}

export default async function updateWorkOrderMilestone(
  milestoneForm: UpdateWorkOrderMilestoneForm,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update WorkOrderMilestones
        set workOrderMilestoneTypeId = ?,
          workOrderMilestoneDate = ?,
          workOrderMilestoneTime = ?,
          workOrderMilestoneDescription = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where workOrderMilestoneId = ?`
    )
    .run(
      milestoneForm.workOrderMilestoneTypeId === ''
        ? undefined
        : milestoneForm.workOrderMilestoneTypeId,
      milestoneForm.workOrderMilestoneDateString === ''
        ? 0
        : dateStringToInteger(milestoneForm.workOrderMilestoneDateString),
      (milestoneForm.workOrderMilestoneTimeString ?? '') === ''
        ? 0
        : timeStringToInteger(milestoneForm.workOrderMilestoneTimeString ?? ''),
      milestoneForm.workOrderMilestoneDescription,

      user.userName,
      Date.now(),
      milestoneForm.workOrderMilestoneId
    )

  database.release()

  return result.changes > 0
}

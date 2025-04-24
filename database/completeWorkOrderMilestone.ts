import {
  dateStringToInteger,
  dateToInteger,
  dateToTimeInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface CompleteWorkOrderMilestoneForm {
  workOrderMilestoneId: number | string
  
  workOrderMilestoneCompletionDateString?: string
  workOrderMilestoneCompletionTimeString?: string
}

export default function completeWorkOrderMilestone(
  milestoneForm: CompleteWorkOrderMilestoneForm,
  user: User
): boolean {
  const rightNow = new Date()

  const database = sqlite(sunriseDB)

  const result = database
    .prepare(
      `update WorkOrderMilestones
        set workOrderMilestoneCompletionDate = ?,
        workOrderMilestoneCompletionTime = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where workOrderMilestoneId = ?`
    )
    .run(
      (milestoneForm.workOrderMilestoneCompletionDateString ?? '') === ''
        ? dateToInteger(rightNow)
        : dateStringToInteger(
            milestoneForm.workOrderMilestoneCompletionDateString!
          ),
      (milestoneForm.workOrderMilestoneCompletionTimeString ?? '') === ''
        ? dateToTimeInteger(rightNow)
        : timeStringToInteger(
            milestoneForm.workOrderMilestoneCompletionTimeString!
          ),
      user.userName,
      rightNow.getTime(),
      milestoneForm.workOrderMilestoneId
    )

  database.close()

  return result.changes > 0
}

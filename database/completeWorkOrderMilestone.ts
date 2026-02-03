import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  dateToInteger,
  dateToTimeInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface CompleteWorkOrderMilestoneForm {
  workOrderMilestoneId: number | string

  workOrderMilestoneCompletionDateString?: '' | DateString
  workOrderMilestoneCompletionTimeString?: '' | TimeString
}

export default function completeWorkOrderMilestone(
  milestoneForm: CompleteWorkOrderMilestoneForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const rightNow = new Date()

  const database = connectedDatabase ?? sqlite(sunriseDB)

  const completionDate =
    (milestoneForm.workOrderMilestoneCompletionDateString ?? '') === ''
      ? dateToInteger(rightNow)
      : dateStringToInteger(
          milestoneForm.workOrderMilestoneCompletionDateString as DateString
        )

  const completionTime =
    (milestoneForm.workOrderMilestoneCompletionTimeString ?? '') === ''
      ? dateToTimeInteger(rightNow)
      : timeStringToInteger(
          milestoneForm.workOrderMilestoneCompletionTimeString as TimeString
        )

  const result = database
    .prepare(/* sql */ `
      UPDATE WorkOrderMilestones
      SET
        workOrderMilestoneCompletionDate = ?,
        workOrderMilestoneCompletionTime = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        workOrderMilestoneId = ?
    `)
    .run(
      completionDate,
      completionTime,
      user.userName,
      rightNow.getTime(),
      milestoneForm.workOrderMilestoneId
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

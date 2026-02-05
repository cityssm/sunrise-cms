import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  dateToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateWorkOrderMilestoneTimeForm {
  workOrderMilestoneId: number | string

  workOrderMilestoneDateString: '' | DateString
  workOrderMilestoneTimeString?: '' | TimeString
}

export function updateWorkOrderMilestoneTime(
  milestoneForm: UpdateWorkOrderMilestoneTimeForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const result = database
    .prepare(/* sql */ `
      UPDATE WorkOrderMilestones
      SET
        workOrderMilestoneDate = ?,
        workOrderMilestoneTime = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        workOrderMilestoneId = ?
    `)
    .run(
      milestoneForm.workOrderMilestoneDateString === ''
        ? dateToInteger(new Date())
        : dateStringToInteger(milestoneForm.workOrderMilestoneDateString),
      (milestoneForm.workOrderMilestoneTimeString ?? '') === ''
        ? undefined
        : timeStringToInteger(
            milestoneForm.workOrderMilestoneTimeString as TimeString
          ),

      user.userName,
      Date.now(),
      milestoneForm.workOrderMilestoneId
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

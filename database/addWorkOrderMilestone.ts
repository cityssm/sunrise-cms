import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddWorkOrderMilestoneForm {
  workOrderId: number | string
  workOrderMilestoneTypeId: number | string

  workOrderMilestoneDateString: '' | DateString
  workOrderMilestoneTimeString?: '' | TimeString

  workOrderMilestoneDescription: string

  workOrderMilestoneCompletionDateString?: '' | DateString
  workOrderMilestoneCompletionTimeString?: '' | TimeString
}

export default function addWorkOrderMilestone(
  milestoneForm: AddWorkOrderMilestoneForm,
  user: User
): number {
  const rightNowMillis = Date.now()

  const database = sqlite(sunriseDB)

  const result = database
    .prepare(
      `insert into WorkOrderMilestones (
        workOrderId, workOrderMilestoneTypeId,
        workOrderMilestoneDate, workOrderMilestoneTime,
        workOrderMilestoneDescription,
        workOrderMilestoneCompletionDate, workOrderMilestoneCompletionTime,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      milestoneForm.workOrderId,
      milestoneForm.workOrderMilestoneTypeId === ''
        ? undefined
        : milestoneForm.workOrderMilestoneTypeId,
      milestoneForm.workOrderMilestoneDateString === ''
        ? 0
        : dateStringToInteger(milestoneForm.workOrderMilestoneDateString),
      (milestoneForm.workOrderMilestoneTimeString ?? '') === ''
        ? undefined
        : timeStringToInteger(
            milestoneForm.workOrderMilestoneTimeString as TimeString
          ),
      milestoneForm.workOrderMilestoneDescription,
      (milestoneForm.workOrderMilestoneCompletionDateString ?? '') === ''
        ? undefined
        : dateStringToInteger(
            milestoneForm.workOrderMilestoneCompletionDateString as DateString
          ),
      (milestoneForm.workOrderMilestoneCompletionTimeString ?? '') === ''
        ? undefined
        : timeStringToInteger(
            milestoneForm.workOrderMilestoneCompletionTimeString as TimeString
          ),
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  database.close()

  return result.lastInsertRowid as number
}

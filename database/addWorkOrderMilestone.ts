import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  dateToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

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
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const rightNowMillis = Date.now()

  const database = connectedDatabase ?? sqlite(sunriseDB)

  const result = database
    .prepare(/* sql */ `
      INSERT INTO
        WorkOrderMilestones (
          workOrderId,
          workOrderMilestoneTypeId,
          workOrderMilestoneDate,
          workOrderMilestoneTime,
          workOrderMilestoneDescription,
          workOrderMilestoneCompletionDate,
          workOrderMilestoneCompletionTime,
          recordCreate_userName,
          recordCreate_timeMillis,
          recordUpdate_userName,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      milestoneForm.workOrderId,
      milestoneForm.workOrderMilestoneTypeId === ''
        ? undefined
        : milestoneForm.workOrderMilestoneTypeId,
      milestoneForm.workOrderMilestoneDateString === ''
        ? dateToInteger(new Date())
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

  if (auditLogIsEnabled) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          WorkOrderMilestones
        WHERE
          workOrderMilestoneId = ?
      `)
      .get(result.lastInsertRowid)

    createAuditLogEntries(
      {
        mainRecordType: 'workOrder',
        mainRecordId: milestoneForm.workOrderId,
        updateTable: 'WorkOrderMilestones',
        recordIndex: String(result.lastInsertRowid)
      },
      [
        {
          property: '*',
          type: 'created',

          from: undefined,
          to: recordAfter
        }
      ],
      user,
      database
    )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.lastInsertRowid as number
}

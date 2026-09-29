import { DatabaseSync } from 'node:sqlite'

import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  dateToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled')

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
  connectedDatabase?: DatabaseSync
): number {
  const rightNowMillis = Date.now()

  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

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
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      milestoneForm.workOrderId,
      milestoneForm.workOrderMilestoneTypeId === ''
        ? null
        : milestoneForm.workOrderMilestoneTypeId,
      milestoneForm.workOrderMilestoneDateString === ''
        ? dateToInteger(new Date())
        : dateStringToInteger(milestoneForm.workOrderMilestoneDateString),
      (milestoneForm.workOrderMilestoneTimeString ?? '') === ''
        ? null
        : timeStringToInteger(
            milestoneForm.workOrderMilestoneTimeString as TimeString
          ),
      milestoneForm.workOrderMilestoneDescription,
      (milestoneForm.workOrderMilestoneCompletionDateString ?? '') === ''
        ? null
        : dateStringToInteger(
            milestoneForm.workOrderMilestoneCompletionDateString as DateString
          ),
      (milestoneForm.workOrderMilestoneCompletionTimeString ?? '') === ''
        ? null
        : timeStringToInteger(
            milestoneForm.workOrderMilestoneCompletionTimeString as TimeString
          ),
      user.username,
      rightNowMillis,
      user.username,
      rightNowMillis
    )

  if (isAuditLoggingEnabled) {
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
        mainRecordId: milestoneForm.workOrderId,
        mainRecordType: 'workOrder',
        recordIndex: result.lastInsertRowid,
        updateTable: 'WorkOrderMilestones'
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

import type { DatabaseSync } from 'node:sqlite'

import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  dateToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'

import { isAuditLoggingEnabled } from '../helpers/config.helpers.js'
import { getDatabaseConnection } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

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

  const database = connectedDatabase ?? getDatabaseConnection()

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
        (
          @workOrderId,
          @workOrderMilestoneTypeId,
          @workOrderMilestoneDate,
          @workOrderMilestoneTime,
          @workOrderMilestoneDescription,
          @workOrderMilestoneCompletionDate,
          @workOrderMilestoneCompletionTime,
          @recordCreate_username,
          @recordCreate_timeMillis,
          @recordUpdate_username,
          @recordUpdate_timeMillis
        )
    `)
    .run({
      workOrderId: milestoneForm.workOrderId,
      workOrderMilestoneTypeId:
        milestoneForm.workOrderMilestoneTypeId === ''
          ? null
          : milestoneForm.workOrderMilestoneTypeId,

      workOrderMilestoneDate:
        milestoneForm.workOrderMilestoneDateString === ''
          ? dateToInteger(new Date())
          : dateStringToInteger(milestoneForm.workOrderMilestoneDateString),

      workOrderMilestoneTime:
        (milestoneForm.workOrderMilestoneTimeString ?? '') === ''
          ? null
          : timeStringToInteger(
              milestoneForm.workOrderMilestoneTimeString as TimeString
            ),

      workOrderMilestoneDescription:
        milestoneForm.workOrderMilestoneDescription,

      workOrderMilestoneCompletionDate:
        (milestoneForm.workOrderMilestoneCompletionDateString ?? '') === ''
          ? null
          : dateStringToInteger(
              milestoneForm.workOrderMilestoneCompletionDateString as DateString
            ),

      workOrderMilestoneCompletionTime:
        (milestoneForm.workOrderMilestoneCompletionTimeString ?? '') === ''
          ? null
          : timeStringToInteger(
              milestoneForm.workOrderMilestoneCompletionTimeString as TimeString
            ),

      recordCreate_username: user.username,
      recordCreate_timeMillis: rightNowMillis,

      recordUpdate_username: user.username,
      recordUpdate_timeMillis: rightNowMillis
    })

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

import type { DatabaseSync } from 'node:sqlite'

import getObjectDifference from '@cityssm/object-difference'
import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'

import { isAuditLoggingEnabled } from '../helpers/config.helpers.js'
import { getDatabaseConnection } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

export interface UpdateWorkOrderMilestoneForm {
  workOrderMilestoneId: number | string

  workOrderMilestoneDateString: '' | DateString
  workOrderMilestoneDescription: string
  workOrderMilestoneTimeString?: '' | TimeString
  workOrderMilestoneTypeId: number | string
}

export default function updateWorkOrderMilestone(
  milestoneForm: UpdateWorkOrderMilestoneForm,
  user: User,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? getDatabaseConnection()

  const recordBefore = isAuditLoggingEnabled
    ? database
        .prepare(/* sql */ `
          SELECT
            *
          FROM
            WorkOrderMilestones
          WHERE
            workOrderMilestoneId = ?
        `)
        .get(milestoneForm.workOrderMilestoneId)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE WorkOrderMilestones
      SET
        workOrderMilestoneTypeId = ?,
        workOrderMilestoneDate = ?,
        workOrderMilestoneTime = ?,
        workOrderMilestoneDescription = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        workOrderMilestoneId = ?
    `)
    .run(
      milestoneForm.workOrderMilestoneTypeId === ''
        ? null
        : milestoneForm.workOrderMilestoneTypeId,

      milestoneForm.workOrderMilestoneDateString === ''
        ? 0
        : dateStringToInteger(milestoneForm.workOrderMilestoneDateString),
      (milestoneForm.workOrderMilestoneTimeString ?? '') === ''
        ? null
        : timeStringToInteger(
            milestoneForm.workOrderMilestoneTimeString as TimeString
          ),
      milestoneForm.workOrderMilestoneDescription,

      user.username,
      Date.now(),
      milestoneForm.workOrderMilestoneId
    )

  if (
    isAuditLoggingEnabled &&
    recordBefore !== undefined &&
    result.changes > 0
  ) {
    const parentId = (recordBefore as Record<string, unknown>)
      .workOrderId as number

    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          WorkOrderMilestones
        WHERE
          workOrderMilestoneId = ?
      `)
      .get(milestoneForm.workOrderMilestoneId)

    const differences = getObjectDifference(recordBefore, recordAfter)

    if (differences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordId: parentId,
          mainRecordType: 'workOrder',
          recordIndex: milestoneForm.workOrderMilestoneId,
          updateTable: 'WorkOrderMilestones'
        },
        differences,
        user,
        database
      )
    }
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

import { DatabaseSync } from 'node:sqlite'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled')

export interface AddForm {
  burialSiteId: number | string
  workOrderId: number | string
}

export default function addWorkOrderBurialSite(
  workOrderBurialSiteForm: AddForm,
  user: User,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const rightNowMillis = Date.now()

  const recordDeleteTimeMillisResult = database
    .prepare(/* sql */ `
      SELECT
        recordDelete_timeMillis
      FROM
        WorkOrderBurialSites
      WHERE
        workOrderId = ?
        AND burialSiteId = ?
    `)
    .get(
      workOrderBurialSiteForm.workOrderId,
      workOrderBurialSiteForm.burialSiteId
    ) as { recordDelete_timeMillis: number | null } | undefined

  if (
    recordDeleteTimeMillisResult === undefined
  ) {
    database
      .prepare(/* sql */ `
        INSERT INTO
          WorkOrderBurialSites (
            workOrderId,
            burialSiteId,
            recordCreate_username,
            recordCreate_timeMillis,
            recordUpdate_username,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?)
      `)
      .run(
        workOrderBurialSiteForm.workOrderId,
        workOrderBurialSiteForm.burialSiteId,
        user.username,
        rightNowMillis,
        user.username,
        rightNowMillis
      )
  } else if (recordDeleteTimeMillisResult.recordDelete_timeMillis !== null) {
    database
      .prepare(/* sql */ `
        UPDATE WorkOrderBurialSites
        SET
          recordCreate_username = ?,
          recordCreate_timeMillis = ?,
          recordUpdate_username = ?,
          recordUpdate_timeMillis = ?,
          recordDelete_username = NULL,
          recordDelete_timeMillis = NULL
        WHERE
          workOrderId = ?
          AND burialSiteId = ?
      `)
      .run(
        user.username,
        rightNowMillis,
        user.username,
        rightNowMillis,
        workOrderBurialSiteForm.workOrderId,
        workOrderBurialSiteForm.burialSiteId
      )
  }

  if (isAuditLoggingEnabled) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          WorkOrderBurialSites
        WHERE
          workOrderId = ?
          AND burialSiteId = ?
      `)
      .get(
        workOrderBurialSiteForm.workOrderId,
        workOrderBurialSiteForm.burialSiteId
      )

    createAuditLogEntries(
      {
        mainRecordId: workOrderBurialSiteForm.workOrderId,
        mainRecordType: 'workOrder',
        recordIndex: workOrderBurialSiteForm.burialSiteId,
        updateTable: 'WorkOrderBurialSites'
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

  return true
}

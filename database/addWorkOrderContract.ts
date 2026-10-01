import { DatabaseSync } from 'node:sqlite'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const isAuditLoggingEnabled = getConfigProperty('settings.auditLog.enabled')

export interface AddForm {
  contractId: number | string
  workOrderId: number | string
}

export default function addWorkOrderContract(
  form: AddForm,
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
        WorkOrderContracts
      WHERE
        workOrderId = ?
        AND contractId = ?
    `)
    .get(form.workOrderId, form.contractId) as
    { recordDelete_timeMillis: number | null } | undefined

  if (recordDeleteTimeMillisResult === undefined) {
    database
      .prepare(/* sql */ `
        INSERT INTO
          WorkOrderContracts (
            workOrderId,
            contractId,
            recordCreate_username,
            recordCreate_timeMillis,
            recordUpdate_username,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?)
      `)
      .run(
        form.workOrderId,
        form.contractId,
        user.username,
        rightNowMillis,
        user.username,
        rightNowMillis
      )
  } else if (recordDeleteTimeMillisResult.recordDelete_timeMillis !== null) {
    database
      .prepare(/* sql */ `
        UPDATE WorkOrderContracts
        SET
          recordCreate_username = ?,
          recordCreate_timeMillis = ?,
          recordUpdate_username = ?,
          recordUpdate_timeMillis = ?,
          recordDelete_username = NULL,
          recordDelete_timeMillis = NULL
        WHERE
          workOrderId = ?
          AND contractId = ?
      `)
      .run(
        user.username,
        rightNowMillis,
        user.username,
        rightNowMillis,
        form.workOrderId,
        form.contractId
      )
  }

  if (isAuditLoggingEnabled) {
    const recordAfter = database
      .prepare(/* sql */ `
        SELECT
          *
        FROM
          WorkOrderContracts
        WHERE
          workOrderId = ?
          AND contractId = ?
      `)
      .get(form.workOrderId, form.contractId)

    createAuditLogEntries(
      {
        mainRecordId: form.workOrderId,
        mainRecordType: 'workOrder',
        recordIndex: form.contractId,
        updateTable: 'WorkOrderContracts'
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

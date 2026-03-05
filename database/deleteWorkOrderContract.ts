import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export default function deleteWorkOrderContract(
  workOrderId: number | string,
  contractId: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const recordBefore = auditLogIsEnabled
    ? database
        .prepare(
          /* sql */ `SELECT * FROM WorkOrderContracts WHERE workOrderId = ? AND contractId = ? AND recordDelete_timeMillis IS NULL`
        )
        .get(workOrderId, contractId)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE WorkOrderContracts
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        workOrderId = ?
        AND contractId = ?
    `)
    .run(user.userName, Date.now(), workOrderId, contractId)

  if (result.changes > 0 && auditLogIsEnabled) {
    createAuditLogEntries(
      {
        mainRecordType: 'workOrder',
        mainRecordId: String(workOrderId),
        updateTable: 'WorkOrderContracts',
        recordIndex: String(contractId)
      },
      [
        {
          property: '*',
          type: 'deleted',
          from: recordBefore,
          to: undefined
        }
      ],
      user,
      database
    )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  return result.changes > 0
}

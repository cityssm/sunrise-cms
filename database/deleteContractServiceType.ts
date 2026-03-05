import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export default function deleteContractServiceType(
  contractId: number | string,
  serviceTypeId: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const recordBefore = auditLogIsEnabled
    ? database
        .prepare(
          /* sql */ `SELECT * FROM ContractServiceTypes WHERE contractId = ? AND serviceTypeId = ? AND recordDelete_timeMillis IS NULL`
        )
        .get(contractId, serviceTypeId)
    : undefined

  const info = database
    .prepare(/* sql */ `
      UPDATE
        ContractServiceTypes
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        contractId = ?
        AND serviceTypeId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(user.userName, rightNowMillis, contractId, serviceTypeId)

  if (info.changes > 0 && auditLogIsEnabled) {
    createAuditLogEntries(
      {
        mainRecordType: 'contract',
        mainRecordId: String(contractId),
        updateTable: 'ContractServiceTypes',
        recordIndex: String(serviceTypeId)
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

  return info.changes > 0
}

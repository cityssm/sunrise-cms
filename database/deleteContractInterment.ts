import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export default function deleteContractInterment(
  contractId: number | string,
  intermentNumber: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const recordBefore = auditLogIsEnabled
    ? database
        .prepare(/* sql */ `
          SELECT
            *
          FROM
            ContractInterments
          WHERE
            contractId = ?
            AND intermentNumber = ?
        `)
        .get(contractId, intermentNumber)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE ContractInterments
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        contractId = ?
        AND intermentNumber = ?
    `)
    .run(user.userName, Date.now(), contractId, intermentNumber)

  if (result.changes > 0 && auditLogIsEnabled) {
    createAuditLogEntries(
      {
        mainRecordId: contractId,
        mainRecordType: 'contract',
        recordIndex: intermentNumber,
        updateTable: 'ContractInterments',
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

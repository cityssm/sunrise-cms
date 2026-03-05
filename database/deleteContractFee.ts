import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export default function deleteContractFee(
  contractId: number | string,
  feeId: number | string,
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
            ContractFees
          WHERE
            contractId = ?
            AND feeId = ?
            AND recordDelete_timeMillis IS NULL
        `)
        .get(contractId, feeId)
    : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE ContractFees
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        contractId = ?
        AND feeId = ?
    `)
    .run(user.userName, Date.now(), contractId, feeId)

  if (result.changes > 0 && auditLogIsEnabled) {
    createAuditLogEntries(
      {
        mainRecordType: 'contract',
        mainRecordId: contractId,
        updateTable: 'ContractFees',
        recordIndex: feeId
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

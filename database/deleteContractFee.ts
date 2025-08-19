import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function deleteContractFee(
  contractId: number | string,
  feeId: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const result = database
    .prepare(
      `update ContractFees
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where contractId = ?
        and feeId = ?`
    )
    .run(user.userName, Date.now(), contractId, feeId)

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function deleteContractTransaction(
  contractId: number | string,
  transactionIndex: number | string,
  user: User
): boolean {
  const database = sqlite(sunriseDB)

  const result = database
    .prepare(
      `update ContractTransactions
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where contractId = ?
        and transactionIndex = ?`
    )
    .run(user.userName, Date.now(), contractId, transactionIndex)

  database.close()

  return result.changes > 0
}

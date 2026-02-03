import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function deleteContractInterment(
  contractId: number | string,
  intermentNumber: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

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

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

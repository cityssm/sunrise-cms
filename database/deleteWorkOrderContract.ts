import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function deleteWorkOrderContract(
  workOrderId: number | string,
  contractId: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

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

  if (connectedDatabase === undefined) {
    database.close()
  }
  return result.changes > 0
}

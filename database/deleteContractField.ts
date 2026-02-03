import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function deleteContractField(
  contractId: number | string,
  contractTypeFieldId: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const result = database
    .prepare(/* sql */ `update ContractFields
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where contractId = ?
        and contractTypeFieldId = ?`
    )
    .run(user.userName, Date.now(), contractId, contractTypeFieldId)

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

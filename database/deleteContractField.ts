import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function deleteContractField(
  contractId: number | string,
  contractTypeFieldId: number | string,
  user: User,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const result = database
    .prepare(/* sql */ `
      UPDATE ContractFields
      SET
        recordDelete_username = ?,
        recordDelete_timeMillis = ?
      WHERE
        contractId = ?
        AND contractTypeFieldId = ?
    `)
    .run(user.username, Date.now(), contractId, contractTypeFieldId)

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

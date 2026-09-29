import { DatabaseSync } from 'node:sqlite'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export default function deleteContractTypePrint(
  contractTypeId: number | string,
  printEJS: string,
  user: User,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const result = database
    .prepare(/* sql */ `
      UPDATE ContractTypePrints
      SET
        recordDelete_username = ?,
        recordDelete_timeMillis = ?
      WHERE
        contractTypeId = ?
        AND printEJS = ?
    `)
    .run(user.username, Date.now(), contractTypeId, printEJS)

  if (connectedDatabase === undefined) {
    database.close()
  }
  clearCacheByTableName('ContractTypePrints')

  return result.changes > 0
}

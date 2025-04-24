import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import { clearCacheByTableName } from '../helpers/functions.cache.js'

export default function deleteContractTypePrint(
  contractTypeId: number | string,
  printEJS: string,
  user: User
): boolean {
  const database = sqlite(sunriseDB)

  const result = database
    .prepare(
      `update ContractTypePrints
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where contractTypeId = ?
        and printEJS = ?`
    )
    .run(user.userName, Date.now(), contractTypeId, printEJS)

  database.close()

  clearCacheByTableName('ContractTypePrints')

  return result.changes > 0
}

import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { MetadataKey } from '../types/contractMetadata.types.js'

export default function deleteContractMetadata(
  contractId: number | string,
  metadataKey: MetadataKey,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  database
    .prepare(/* sql */ `update ContractMetadata
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where contractId = ?
          and metadataKey = ?`
    )
    .run(user.userName, Date.now(), contractId, metadataKey)

  if (connectedDatabase === undefined) {
    database.close()
  }

  return true
}

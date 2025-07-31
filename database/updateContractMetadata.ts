import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { MetadataKey } from '../types/contractMetadata.types.js'

export default function updateContractMetadata(
  contractId: number | string,
  metadata: {
    metadataKey: MetadataKey
    metadataValue: string
  },
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const rightNow = Date.now()

  const database = connectedDatabase ?? sqlite(sunriseDB)

  let result = database
    .prepare(
      `update ContractMetadata
        set metadataValue = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?,
          recordDelete_userName = null,
          recordDelete_timeMillis = null
        where contractId = ?
          and metadataKey = ?`
    )
    .run(
      metadata.metadataValue,
      user.userName,
      rightNow,
      contractId,
      metadata.metadataKey
    )

  if (result.changes <= 0) {
    result = database
      .prepare(
        `insert into ContractMetadata (
          contractId, metadataKey, metadataValue,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
         values (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        contractId,
        metadata.metadataKey,
        metadata.metadataValue,
        user.userName,
        rightNow,
        user.userName,
        rightNow
      )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

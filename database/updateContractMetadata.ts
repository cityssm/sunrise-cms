import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { MetadataKey } from '../types/contractMetadata.types.js'

export default function updateContractMetadata(
  contractId: number | string,
  metadata: {
    metadataKey: MetadataKey
    metadataValue: string
  },
  user: User,
  connectedDatabase?: DatabaseSync
): boolean {
  const rightNow = Date.now()

  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  let result = database
    .prepare(/* sql */ `
      UPDATE ContractMetadata
      SET
        metadataValue = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?,
        recordDelete_username = NULL,
        recordDelete_timeMillis = NULL
      WHERE
        contractId = ?
        AND metadataKey = ?
    `)
    .run(
      metadata.metadataValue,
      user.username,
      rightNow,
      contractId,
      metadata.metadataKey
    )

  if (result.changes <= 0) {
    result = database
      .prepare(/* sql */ `
        INSERT INTO
          ContractMetadata (
            contractId,
            metadataKey,
            metadataValue,
            recordCreate_username,
            recordCreate_timeMillis,
            recordUpdate_username,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        contractId,
        metadata.metadataKey,
        metadata.metadataValue,
        user.username,
        rightNow,
        user.username,
        rightNow
      )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type {
  MetadataKey,
  MetadataPrefix
} from '../types/contractMetadata.types.js'

export default function getContractMetadataByContractId(
  contractId: number | string,
  startsWith: '' | MetadataPrefix = '',
  connectedDatabase?: DatabaseSync
): Partial<Record<MetadataKey, string>> {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const result = database
    .prepare(/* sql */ `
      SELECT
        metadataKey,
        metadataValue
      FROM
        ContractMetadata
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId = ?
        AND metadataKey like ? || '%'
      ORDER BY
        metadataKey
    `)
    .all(contractId, startsWith) as Array<{
    metadataKey: MetadataKey
    metadataValue: string
  }>

  if (connectedDatabase === undefined) {
    database.close()
  }
  const metadata: Partial<Record<MetadataKey, string>> = {}

  for (const row of result) {
    metadata[row.metadataKey] = row.metadataValue
  }

  return metadata
}

import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type {
  MetadataKey,
  MetadataPrefix
} from '../types/contractMetadata.types.js'

export default function getContractMetadataByContractId(
  contractId: number | string,
  startsWith: '' | MetadataPrefix = ''
): Partial<Record<MetadataKey, string>> {
  const database = sqlite(sunriseDB, { readonly: true })

  const result = database
    .prepare(
      `select metadataKey, metadataValue
        from ContractMetadata
        where recordDelete_timeMillis is null
        and contractId = ?
        and metadataKey like ? || '%'
        order by metadataKey`
    )
    .all(contractId, startsWith) as Array<{
    metadataKey: MetadataKey
    metadataValue: string
  }>

  database.close()

  const metadata: Partial<Record<MetadataKey, string>> = {}

  for (const row of result) {
    metadata[row.metadataKey] = row.metadataValue
  }

  return metadata
}

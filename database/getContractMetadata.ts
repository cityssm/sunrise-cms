import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function getContractMetadata(
  contractId: number | string,
  startsWith = ''
): Record<string, string> {
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
    metadataKey: string
    metadataValue: string
  }>

  database.close()

  const metadata: Record<string, string> = {}

  for (const row of result) {
    metadata[row.metadataKey] = row.metadataValue
  }

  return metadata
}

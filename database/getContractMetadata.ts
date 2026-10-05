import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { MetadataPrefix } from '../types/contractMetadata.types.js'
import type { ContractMetadata } from '../types/record.types.js'

export default function getContractMetadata(
  filters: {
    contractId?: number | string
    startsWith?: '' | MetadataPrefix
  },
  connectedDatabase?: DatabaseSync
): ContractMetadata[] {
  const database =
    connectedDatabase ?? new DatabaseSync(sunriseDB, { readOnly: true })

  let sql = /* sql */ `
    SELECT
      contractId,
      metadataKey,
      metadataValue,
      recordUpdate_timeMillis
    FROM
      ContractMetadata
    WHERE
      recordDelete_timeMillis IS NULL
  `

  const sqlParameters: Array<number | string> = []

  if (filters.contractId !== undefined) {
    sql += ' AND contractId = ?'
    sqlParameters.push(filters.contractId)
  }

  if (filters.startsWith !== undefined && filters.startsWith !== '') {
    sql += " AND metadataKey like ? || '%'"
    sqlParameters.push(filters.startsWith)
  }

  const rows = database
    .prepare(sql)
    .all(...sqlParameters) as unknown as ContractMetadata[]

  if (connectedDatabase === undefined) {
    database.close()
  }
  return rows
}

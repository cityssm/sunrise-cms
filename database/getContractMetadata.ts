import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { MetadataPrefix } from '../types/contractMetadata.types.js'
import type { ContractMetadata } from '../types/record.types.js'

export default function getContractMetadata(filters: {
  contractId?: number | string
  startsWith?: '' | MetadataPrefix
}, connectedDatabase?: sqlite.Database): ContractMetadata[] {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  let sql = `select contractId, metadataKey, metadataValue, recordUpdate_timeMillis
    from ContractMetadata
    where recordDelete_timeMillis is null`

  const sqlParameters: Array<number | string> = []

  if (filters.contractId !== undefined) {
    sql += ' and contractId = ?'
    sqlParameters.push(filters.contractId)
  }

  if (filters.startsWith !== undefined && filters.startsWith !== '') {
    sql += " and metadataKey like ? || '%'"
    sqlParameters.push(filters.startsWith)
  }

  const rows = database.prepare(sql).all(sqlParameters) as ContractMetadata[]

  if (connectedDatabase === undefined) {


    database.close()


  }
  return rows
}

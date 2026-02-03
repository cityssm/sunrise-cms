import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddForm {
  contractType: string
  isPreneed?: string
  orderNumber?: number
}

export default function addContractType(
  addForm: AddForm,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      INSERT INTO
        ContractTypes (
          contractType,
          isPreneed,
          orderNumber,
          recordCreate_userName,
          recordCreate_timeMillis,
          recordUpdate_userName,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      addForm.contractType,
      addForm.isPreneed === undefined ? 0 : 1,
      addForm.orderNumber ?? -1,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  if (connectedDatabase === undefined) {
    database.close()
  }
  clearCacheByTableName('ContractTypes')

  return result.lastInsertRowid as number
}

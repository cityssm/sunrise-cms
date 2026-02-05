import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export interface UpdateForm {
  contractTypeId: number | string

  contractType: string
  isPreneed?: string
}

export default function updateContractType(
  updateForm: UpdateForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `
      UPDATE ContractTypes
      SET
        contractType = ?,
        isPreneed = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractTypeId = ?
    `)
    .run(
      updateForm.contractType,
      updateForm.isPreneed === undefined ? 0 : 1,
      user.userName,
      rightNowMillis,
      updateForm.contractTypeId
    )

  if (connectedDatabase === undefined) {
    database.close()
  }

  clearCacheByTableName('ContractTypes')

  return result.changes > 0
}

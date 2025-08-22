import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export interface AddContractTypePrintForm {
  contractTypeId: number | string
  printEJS: string

  orderNumber?: number
}

export default function addContractTypePrint(
  addForm: AddContractTypePrintForm,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  let result = database
    .prepare(
      `update ContractTypePrints
        set recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?,
          recordDelete_userName = null,
          recordDelete_timeMillis = null
        where contractTypeId = ?
          and printEJS = ?`
    )
    .run(
      user.userName,
      rightNowMillis,
      addForm.contractTypeId,
      addForm.printEJS
    )

  if (result.changes === 0) {
    result = database
      .prepare(
        `insert into ContractTypePrints (
          contractTypeId, printEJS, orderNumber,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        addForm.contractTypeId,
        addForm.printEJS,
        addForm.orderNumber ?? -1,
        user.userName,
        rightNowMillis,
        user.userName,
        rightNowMillis
      )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  clearCacheByTableName('ContractTypePrints')

  return result.changes > 0
}

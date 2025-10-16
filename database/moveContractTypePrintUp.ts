import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export function moveContractTypePrintUp(
  contractTypeId: number | string,
  printEJS: string,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const currentOrderNumber = (
    database
      .prepare(
        'select orderNumber from ContractTypePrints where contractTypeId = ? and printEJS = ?'
      )
      .get(contractTypeId, printEJS) as { orderNumber: number }
  ).orderNumber

  if (currentOrderNumber <= 0) {
    if (connectedDatabase === undefined) {
      database.close()
    }
    return true
  }

  database
    .prepare(
      `update ContractTypePrints
        set orderNumber = orderNumber + 1
        where recordDelete_timeMillis is null
          and contractTypeId = ?
          and orderNumber = ? - 1`
    )
    .run(contractTypeId, currentOrderNumber)

  const result = database
    .prepare(
      'update ContractTypePrints set orderNumber = ? - 1 where contractTypeId = ? and printEJS = ?'
    )
    .run(currentOrderNumber, contractTypeId, printEJS)

  if (connectedDatabase === undefined) {
    database.close()
  }
  
  clearCacheByTableName('ContractTypePrints')

  return result.changes > 0
}

export function moveContractTypePrintUpToTop(
  contractTypeId: number | string,
  printEJS: string,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const currentOrderNumber = (
    database
      .prepare(
        'select orderNumber from ContractTypePrints where contractTypeId = ? and printEJS = ?'
      )
      .get(contractTypeId, printEJS) as { orderNumber: number }
  ).orderNumber

  if (currentOrderNumber > 0) {
    database
      .prepare(
        `update ContractTypePrints
          set orderNumber = -1
          where contractTypeId = ?
          and printEJS = ?`
      )
      .run(contractTypeId, printEJS)

    database
      .prepare(
        `update ContractTypePrints
          set orderNumber = orderNumber + 1
          where recordDelete_timeMillis is null
          and contractTypeId = ?
          and orderNumber < ?`
      )
      .run(contractTypeId, currentOrderNumber)
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  clearCacheByTableName('ContractTypePrints')

  return true
}

export default moveContractTypePrintUp

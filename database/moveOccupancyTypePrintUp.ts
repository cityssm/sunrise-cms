import { clearCacheByTableName } from '../helpers/functions.cache.js'

import { acquireConnection } from './pool.js'

export async function moveOccupancyTypePrintUp(
  contractTypeId: number | string,
  printEJS: string
): Promise<boolean> {
  const database = await acquireConnection()

  const currentOrderNumber = (
    database
      .prepare(
        'select orderNumber from ContractTypePrints where contractTypeId = ? and printEJS = ?'
      )
      .get(contractTypeId, printEJS) as { orderNumber: number }
  ).orderNumber

  if (currentOrderNumber <= 0) {
    database.release()
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

  database.release()

  clearCacheByTableName('ContractTypePrints')

  return result.changes > 0
}

export async function moveOccupancyTypePrintUpToTop(
  contractTypeId: number | string,
  printEJS: string
): Promise<boolean> {
  const database = await acquireConnection()

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

  database.release()

  clearCacheByTableName('ContractTypePrints')

  return true
}

export default moveOccupancyTypePrintUp

import { clearCacheByTableName } from '../helpers/functions.cache.js'

import { acquireConnection } from './pool.js'

export async function moveContractTypePrintDown(
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

  database
    .prepare(
      `update ContractTypePrints
        set orderNumber = orderNumber - 1
        where recordDelete_timeMillis is null
        and contractTypeId = ?
        and orderNumber = ? + 1`
    )
    .run(contractTypeId, currentOrderNumber)

  const result = database
    .prepare(
      'update ContractTypePrints set orderNumber = ? + 1 where contractTypeId = ? and printEJS = ?'
    )
    .run(currentOrderNumber, contractTypeId, printEJS)

  database.release()

  clearCacheByTableName('ContractTypePrints')

  return result.changes > 0
}

export async function moveContractTypePrintDownToBottom(
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

  const maxOrderNumber: number = (
    database
      .prepare(
        `select max(orderNumber) as maxOrderNumber
        from ContractTypePrints
        where recordDelete_timeMillis is null
        and contractTypeId = ?`
      )
      .get(contractTypeId) as { maxOrderNumber: number }
  ).maxOrderNumber

  if (currentOrderNumber !== maxOrderNumber) {
    database
      .prepare(
        `update ContractTypePrints
          set orderNumber = ? + 1
          where contractTypeId = ?
          and printEJS = ?`
      )
      .run(maxOrderNumber, contractTypeId, printEJS)

    database
      .prepare(
        `update ContractTypePrints
          set orderNumber = orderNumber - 1
          where recordDelete_timeMillis is null
          and contractTypeId = ?
          and orderNumber > ?`
      )
      .run(contractTypeId, currentOrderNumber)
  }

  database.release()

  clearCacheByTableName('ContractTypePrints')

  return true
}

export default moveContractTypePrintDown

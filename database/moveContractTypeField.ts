import type { PoolConnection } from 'better-sqlite-pool'

import { clearCacheByTableName } from '../helpers/functions.cache.js'

import { acquireConnection } from './pool.js'
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

function getCurrentField(
  contractTypeFieldId: number | string,
  connectedDatabase: PoolConnection
): { contractTypeId?: number; orderNumber: number } {
  return connectedDatabase
    .prepare(
      `select contractTypeId, orderNumber
        from ContractTypeFields
        where contractTypeFieldId = ?`
    )
    .get(contractTypeFieldId) as {
    contractTypeId?: number
    orderNumber: number
  }
}

export async function moveContractTypeFieldDown(
  contractTypeFieldId: number | string
): Promise<boolean> {
  const database = await acquireConnection()

  const currentField = getCurrentField(contractTypeFieldId, database)

  database
    .prepare(
      `update ContractTypeFields
        set orderNumber = orderNumber - 1
        where recordDelete_timeMillis is null
        ${
          currentField.contractTypeId === undefined
            ? ' and contractTypeId is null'
            : ` and contractTypeId = '${currentField.contractTypeId.toString()}'`
        }
        and orderNumber = ? + 1`
    )
    .run(currentField.orderNumber)

  const success = updateRecordOrderNumber(
    'ContractTypeFields',
    contractTypeFieldId,
    currentField.orderNumber + 1,
    database
  )

  database.release()

  clearCacheByTableName('ContractTypeFields')

  return success
}

export async function moveContractTypeFieldDownToBottom(
  contractTypeFieldId: number | string
): Promise<boolean> {
  const database = await acquireConnection()

  const currentField = getCurrentField(contractTypeFieldId, database)

  const contractTypeParameters: unknown[] = []

  if (currentField.contractTypeId) {
    contractTypeParameters.push(currentField.contractTypeId)
  }

  const maxOrderNumber: number = (
    database
      .prepare(
        `select max(orderNumber) as maxOrderNumber
          from ContractTypeFields
          where recordDelete_timeMillis is null
          ${
            currentField.contractTypeId === undefined
              ? ' and contractTypeId is null'
              : ' and contractTypeId = ?'
          }`
      )
      .get(contractTypeParameters) as { maxOrderNumber: number }
  ).maxOrderNumber

  if (currentField.orderNumber !== maxOrderNumber) {
    updateRecordOrderNumber(
      'ContractTypeFields',
      contractTypeFieldId,
      maxOrderNumber + 1,
      database
    )

    contractTypeParameters.push(currentField.orderNumber)

    database
      .prepare(
        `update ContractTypeFields set orderNumber = orderNumber - 1
          where recordDelete_timeMillis is null
          ${
            currentField.contractTypeId === undefined
              ? ' and contractTypeId is null'
              : ' and contractTypeId = ?'
          }
          and orderNumber > ?`
      )
      .run(contractTypeParameters)
  }

  database.release()

  clearCacheByTableName('ContractTypeFields')

  return true
}

export async function moveContractTypeFieldUp(
  contractTypeFieldId: number | string
): Promise<boolean> {
  const database = await acquireConnection()

  const currentField = getCurrentField(contractTypeFieldId, database)

  if (currentField.orderNumber <= 0) {
    database.release()
    return true
  }

  database
    .prepare(
      `update ContractTypeFields
        set orderNumber = orderNumber + 1
        where recordDelete_timeMillis is null
        ${
          currentField.contractTypeId === undefined
            ? ' and contractTypeId is null'
            : ` and contractTypeId = '${currentField.contractTypeId.toString()}'`
        }
        and orderNumber = ? - 1`
    )
    .run(currentField.orderNumber)

  const success = updateRecordOrderNumber(
    'ContractTypeFields',
    contractTypeFieldId,
    currentField.orderNumber - 1,
    database
  )

  database.release()

  clearCacheByTableName('ContractTypeFields')

  return success
}

export async function moveContractTypeFieldUpToTop(
  contractTypeFieldId: number | string
): Promise<boolean> {
  const database = await acquireConnection()

  const currentField = getCurrentField(contractTypeFieldId, database)

  if (currentField.orderNumber > 0) {
    updateRecordOrderNumber(
      'ContractTypeFields',
      contractTypeFieldId,
      -1,
      database
    )

    const contractTypeParameters: unknown[] = []

    if (currentField.contractTypeId) {
      contractTypeParameters.push(currentField.contractTypeId)
    }

    contractTypeParameters.push(currentField.orderNumber)

    database
      .prepare(
        `update ContractTypeFields
          set orderNumber = orderNumber + 1
          where recordDelete_timeMillis is null
          ${
            currentField.contractTypeId
              ? ' and contractTypeId = ?'
              : ' and contractTypeId is null'
          } and orderNumber < ?`
      )
      .run(contractTypeParameters)
  }

  database.release()

  clearCacheByTableName('ContractTypeFields')

  return true
}

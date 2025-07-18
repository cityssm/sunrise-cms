import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

export function moveContractTypeFieldDown(
  contractTypeFieldId: number | string
): boolean {
  const database = sqlite(sunriseDB)

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

  database.close()

  clearCacheByTableName('ContractTypeFields')

  return success
}

export function moveContractTypeFieldDownToBottom(
  contractTypeFieldId: number | string
): boolean {
  const database = sqlite(sunriseDB)

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

  database.close()

  clearCacheByTableName('ContractTypeFields')

  return true
}

export function moveContractTypeFieldUp(
  contractTypeFieldId: number | string
): boolean {
  const database = sqlite(sunriseDB)

  const currentField = getCurrentField(contractTypeFieldId, database)

  if (currentField.orderNumber <= 0) {
    database.close()
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

  database.close()

  clearCacheByTableName('ContractTypeFields')

  return success
}

export function moveContractTypeFieldUpToTop(
  contractTypeFieldId: number | string
): boolean {
  const database = sqlite(sunriseDB)

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

  database.close()

  clearCacheByTableName('ContractTypeFields')

  return true
}

function getCurrentField(
  contractTypeFieldId: number | string,
  connectedDatabase: sqlite.Database
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

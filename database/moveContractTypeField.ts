/* eslint-disable unicorn/no-unsafe-sqlite-interpolation */
import { type SQLInputValue, DatabaseSync } from 'node:sqlite'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import updateRecordOrderNumber from './updateRecordOrderNumber.js'

export function moveContractTypeFieldDown(
  contractTypeFieldId: number | string
): boolean {
  const database = new DatabaseSync(sunriseDB)

  const currentField = getCurrentField(contractTypeFieldId, database)

  database
    // eslint-disable-next-line sqlite-security/no-unsafe-query
    .prepare(/* sql */ `
      UPDATE ContractTypeFields
      SET
        orderNumber = orderNumber - 1
      WHERE
        recordDelete_timeMillis IS NULL ${currentField.contractTypeId ===
        undefined
          ? ' AND contractTypeId IS NULL'
          : ` AND contractTypeId = '${currentField.contractTypeId.toString()}'`}
        AND orderNumber = ? + 1
    `)
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
  const database = new DatabaseSync(sunriseDB)

  const currentField = getCurrentField(contractTypeFieldId, database)

  const contractTypeParameters: SQLInputValue[] = []

  if (currentField.contractTypeId) {
    contractTypeParameters.push(currentField.contractTypeId)
  }

  const maxOrderNumber: number = (
    database
      // eslint-disable-next-line sqlite-security/no-unsafe-query
      .prepare(/* sql */ `
        SELECT
          MAX(orderNumber) AS maxOrderNumber
        FROM
          ContractTypeFields
        WHERE
          recordDelete_timeMillis IS NULL ${currentField.contractTypeId ===
          undefined
            ? ' AND contractTypeId IS NULL'
            : ' AND contractTypeId = ?'}
      `)
      .get(...contractTypeParameters) as { maxOrderNumber: number }
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
      // eslint-disable-next-line sqlite-security/no-unsafe-query
      .prepare(/* sql */ `
        UPDATE ContractTypeFields
        SET
          orderNumber = orderNumber - 1
        WHERE
          recordDelete_timeMillis IS NULL ${currentField.contractTypeId ===
          undefined
            ? ' AND contractTypeId IS NULL'
            : ' AND contractTypeId = ?'}
          AND orderNumber > ?
      `)
      .run(...contractTypeParameters)
  }

  database.close()

  clearCacheByTableName('ContractTypeFields')

  return true
}

export function moveContractTypeFieldUp(
  contractTypeFieldId: number | string
): boolean {
  const database = new DatabaseSync(sunriseDB)

  const currentField = getCurrentField(contractTypeFieldId, database)

  if (currentField.orderNumber <= 0) {
    database.close()
    return true
  }

  database
    // eslint-disable-next-line sqlite-security/no-unsafe-query
    .prepare(/* sql */ `
      UPDATE ContractTypeFields
      SET
        orderNumber = orderNumber + 1
      WHERE
        recordDelete_timeMillis IS NULL ${currentField.contractTypeId ===
        undefined
          ? ' AND contractTypeId IS NULL'
          : ` AND contractTypeId = '${currentField.contractTypeId.toString()}'`}
        AND orderNumber = ? - 1
    `)
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
  const database = new DatabaseSync(sunriseDB)

  const currentField = getCurrentField(contractTypeFieldId, database)

  if (currentField.orderNumber > 0) {
    updateRecordOrderNumber(
      'ContractTypeFields',
      contractTypeFieldId,
      -1,
      database
    )

    const contractTypeParameters: SQLInputValue[] = []

    if (currentField.contractTypeId) {
      contractTypeParameters.push(currentField.contractTypeId)
    }

    contractTypeParameters.push(currentField.orderNumber)

    database
      // eslint-disable-next-line sqlite-security/no-unsafe-query
      .prepare(/* sql */ `
        UPDATE ContractTypeFields
        SET
          orderNumber = orderNumber + 1
        WHERE
          recordDelete_timeMillis IS NULL ${currentField.contractTypeId
            ? ' AND contractTypeId = ?'
            : ' AND contractTypeId IS NULL'}
          AND orderNumber < ?
      `)
      .run(...contractTypeParameters)
  }

  database.close()

  clearCacheByTableName('ContractTypeFields')

  return true
}

function getCurrentField(
  contractTypeFieldId: number | string,
  connectedDatabase: DatabaseSync
): { contractTypeId?: number; orderNumber: number } {
  return connectedDatabase
    .prepare(/* sql */ `
      SELECT
        contractTypeId,
        orderNumber
      FROM
        ContractTypeFields
      WHERE
        contractTypeFieldId = ?
    `)
    .get(contractTypeFieldId) as {
    contractTypeId?: number
    orderNumber: number
  }
}

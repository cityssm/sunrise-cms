import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

export function moveContractTypeFieldDown(
  contractTypeFieldId: number | string
): boolean {
  const database = sqlite(sunriseDB)

  const currentField = getCurrentField(contractTypeFieldId, database)

  // eslint-disable-next-line sonarjs/sql-queries
  database
    .prepare(/* sql */ `
      UPDATE ContractTypeFields
      SET
        orderNumber = orderNumber - 1
      WHERE
        recordDelete_timeMillis IS NULL ${currentField.contractTypeId ===
        undefined
          ? ' and contractTypeId is null'
          : ` and contractTypeId = '${currentField.contractTypeId.toString()}'`}
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
  const database = sqlite(sunriseDB)

  const currentField = getCurrentField(contractTypeFieldId, database)

  const contractTypeParameters: unknown[] = []

  if (currentField.contractTypeId) {
    contractTypeParameters.push(currentField.contractTypeId)
  }

  const maxOrderNumber: number = (
    // eslint-disable-next-line sonarjs/sql-queries
    database
      .prepare(/* sql */ `
        SELECT
          max(orderNumber) AS maxOrderNumber
        FROM
          ContractTypeFields
        WHERE
          recordDelete_timeMillis IS NULL ${currentField.contractTypeId ===
          undefined
            ? ' and contractTypeId is null'
            : ' and contractTypeId = ?'}
      `)
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

    // eslint-disable-next-line sonarjs/sql-queries
    database
      .prepare(/* sql */ `
        UPDATE ContractTypeFields
        SET
          orderNumber = orderNumber - 1
        WHERE
          recordDelete_timeMillis IS NULL ${currentField.contractTypeId ===
          undefined
            ? ' AND contractTypeId is null'
            : ' AND contractTypeId = ?'}
          AND orderNumber > ?
      `)
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

  // eslint-disable-next-line sonarjs/sql-queries
  database
    .prepare(/* sql */ `
      UPDATE ContractTypeFields
      SET
        orderNumber = orderNumber + 1
      WHERE
        recordDelete_timeMillis IS NULL ${currentField.contractTypeId ===
        undefined
          ? ' AND contractTypeId is null'
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

    // eslint-disable-next-line sonarjs/sql-queries
    database
      .prepare(/* sql */ `
        UPDATE ContractTypeFields
        SET
          orderNumber = orderNumber + 1
        WHERE
          recordDelete_timeMillis IS NULL ${currentField.contractTypeId
            ? ' AND contractTypeId = ?'
            : ' AND contractTypeId is null'}
          AND orderNumber < ?
      `)
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

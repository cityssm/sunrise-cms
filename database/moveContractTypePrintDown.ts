import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

export function moveContractTypePrintDown(
  contractTypeId: number | string,
  printEJS: string,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const currentOrderNumber = (
    database
      .prepare(/* sql */ `
        SELECT
          orderNumber
        FROM
          ContractTypePrints
        WHERE
          contractTypeId = ?
          AND printEJS = ?
      `)
      .get(contractTypeId, printEJS) as { orderNumber: number }
  ).orderNumber

  database
    .prepare(/* sql */ `
      UPDATE ContractTypePrints
      SET
        orderNumber = orderNumber - 1
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractTypeId = ?
        AND orderNumber = ? + 1
    `)
    .run(contractTypeId, currentOrderNumber)

  const result = database
    .prepare(/* sql */ `
      UPDATE ContractTypePrints
      SET
        orderNumber = ? + 1
      WHERE
        contractTypeId = ?
        AND printEJS = ?
    `)
    .run(currentOrderNumber, contractTypeId, printEJS)

  if (connectedDatabase === undefined) {
    database.close()
  }
  clearCacheByTableName('ContractTypePrints')

  return result.changes > 0
}

export function moveContractTypePrintDownToBottom(
  contractTypeId: number | string,
  printEJS: string,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const currentOrderNumber = (
    database
      .prepare(/* sql */ `
        SELECT
          orderNumber
        FROM
          ContractTypePrints
        WHERE
          contractTypeId = ?
          AND printEJS = ?
      `)
      .get(contractTypeId, printEJS) as { orderNumber: number }
  ).orderNumber

  const maxOrderNumber: number = (
    database
      .prepare(/* sql */ `
        SELECT
          max(orderNumber) AS maxOrderNumber
        FROM
          ContractTypePrints
        WHERE
          recordDelete_timeMillis IS NULL
          AND contractTypeId = ?
      `)
      .get(contractTypeId) as { maxOrderNumber: number }
  ).maxOrderNumber

  if (currentOrderNumber !== maxOrderNumber) {
    database
      .prepare(/* sql */ `
        UPDATE ContractTypePrints
        SET
          orderNumber = ? + 1
        WHERE
          contractTypeId = ?
          AND printEJS = ?
      `)
      .run(maxOrderNumber, contractTypeId, printEJS)

    database
      .prepare(/* sql */ `
        UPDATE ContractTypePrints
        SET
          orderNumber = orderNumber - 1
        WHERE
          recordDelete_timeMillis IS NULL
          AND contractTypeId = ?
          AND orderNumber > ?
      `)
      .run(contractTypeId, currentOrderNumber)
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  clearCacheByTableName('ContractTypePrints')

  return true
}

export default moveContractTypePrintDown

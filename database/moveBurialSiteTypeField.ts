import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

export function moveBurialSiteTypeFieldDown(
  burialSiteTypeFieldId: number | string
): boolean {
  const database = sqlite(sunriseDB)

  const currentField = getCurrentField(burialSiteTypeFieldId, database)

  database
    .prepare(/* sql */ `
      UPDATE BurialSiteTypeFields
      SET
        orderNumber = orderNumber - 1
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteTypeId = ?
        AND orderNumber = ? + 1
    `)
    .run(currentField.burialSiteTypeId, currentField.orderNumber)

  const success = updateRecordOrderNumber(
    'BurialSiteTypeFields',
    burialSiteTypeFieldId,
    currentField.orderNumber + 1,
    database
  )

  database.close()

  clearCacheByTableName('BurialSiteTypeFields')

  return success
}

export function moveBurialSiteTypeFieldDownToBottom(
  burialSiteTypeFieldId: number | string
): boolean {
  const database = sqlite(sunriseDB)

  const currentField = getCurrentField(burialSiteTypeFieldId, database)

  const maxOrderNumber = (
    database
      .prepare(/* sql */ `
        SELECT
          max(orderNumber) AS maxOrderNumber
        FROM
          BurialSiteTypeFields
        WHERE
          recordDelete_timeMillis IS NULL
          AND burialSiteTypeId = ?
      `)
      .get(currentField.burialSiteTypeId) as { maxOrderNumber: number }
  ).maxOrderNumber

  if (currentField.orderNumber !== maxOrderNumber) {
    updateRecordOrderNumber(
      'BurialSiteTypeFields',
      burialSiteTypeFieldId,
      maxOrderNumber + 1,
      database
    )

    database
      .prepare(/* sql */ `
        UPDATE BurialSiteTypeFields
        SET
          orderNumber = orderNumber - 1
        WHERE
          recordDelete_timeMillis IS NULL
          AND burialSiteTypeId = ?
          AND orderNumber > ?
      `)
      .run(currentField.burialSiteTypeId, currentField.orderNumber)
  }

  database.close()

  clearCacheByTableName('BurialSiteTypeFields')

  return true
}

export function moveBurialSiteTypeFieldUp(
  burialSiteTypeFieldId: number | string
): boolean {
  const database = sqlite(sunriseDB)

  const currentField = getCurrentField(burialSiteTypeFieldId, database)

  if (currentField.orderNumber <= 0) {
    database.close()
    return true
  }

  database
    .prepare(/* sql */ `
      UPDATE BurialSiteTypeFields
      SET
        orderNumber = orderNumber + 1
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteTypeId = ?
        AND orderNumber = ? - 1
    `)
    .run(currentField.burialSiteTypeId, currentField.orderNumber)

  const success = updateRecordOrderNumber(
    'BurialSiteTypeFields',
    burialSiteTypeFieldId,
    currentField.orderNumber - 1,
    database
  )

  database.close()

  clearCacheByTableName('BurialSiteTypeFields')

  return success
}

export function moveBurialSiteTypeFieldUpToTop(
  burialSiteTypeFieldId: number | string
): boolean {
  const database = sqlite(sunriseDB)

  const currentField = getCurrentField(burialSiteTypeFieldId, database)

  if (currentField.orderNumber > 0) {
    updateRecordOrderNumber(
      'BurialSiteTypeFields',
      burialSiteTypeFieldId,
      -1,
      database
    )

    database
      .prepare(/* sql */ `
        UPDATE BurialSiteTypeFields
        SET
          orderNumber = orderNumber + 1
        WHERE
          recordDelete_timeMillis IS NULL
          AND burialSiteTypeId = ?
          AND orderNumber < ?
      `)
      .run(currentField.burialSiteTypeId, currentField.orderNumber)
  }

  database.close()

  clearCacheByTableName('BurialSiteTypeFields')

  return true
}

function getCurrentField(
  burialSiteTypeFieldId: number | string,
  connectedDatabase: sqlite.Database
): { burialSiteTypeId?: number; orderNumber: number } {
  return connectedDatabase
    .prepare(/* sql */ `
      SELECT
        burialSiteTypeId,
        orderNumber
      FROM
        BurialSiteTypeFields
      WHERE
        burialSiteTypeFieldId = ?
    `)
    .get(burialSiteTypeFieldId) as {
    burialSiteTypeId?: number
    orderNumber: number
  }
}

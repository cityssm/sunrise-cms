import type { PoolConnection } from 'better-sqlite-pool'

import { clearCacheByTableName } from '../helpers/functions.cache.js'

import { acquireConnection } from './pool.js'
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

function getCurrentField(
  burialSiteTypeFieldId: number | string,
  connectedDatabase: PoolConnection
): { burialSiteTypeId?: number; orderNumber: number } {
  return connectedDatabase
    .prepare(
      'select burialSiteTypeId, orderNumber from BurialSiteTypeFields where burialSiteTypeFieldId = ?'
    )
    .get(burialSiteTypeFieldId) as {
    burialSiteTypeId?: number
    orderNumber: number
  }
}

export async function moveBurialSiteTypeFieldDown(
  burialSiteTypeFieldId: number | string
): Promise<boolean> {
  const database = await acquireConnection()

  const currentField = getCurrentField(burialSiteTypeFieldId, database)

  database
    .prepare(
      `update BurialSiteTypeFields
        set orderNumber = orderNumber - 1
        where recordDelete_timeMillis is null
        and burialSiteTypeId = ? and orderNumber = ? + 1`
    )
    .run(currentField.burialSiteTypeId, currentField.orderNumber)

  const success = updateRecordOrderNumber(
    'BurialSiteTypeFields',
    burialSiteTypeFieldId,
    currentField.orderNumber + 1,
    database
  )

  database.release()

  clearCacheByTableName('BurialSiteTypeFields')

  return success
}

export async function moveBurialSiteTypeFieldDownToBottom(
  burialSiteTypeFieldId: number | string
): Promise<boolean> {
  const database = await acquireConnection()

  const currentField = getCurrentField(burialSiteTypeFieldId, database)

  const maxOrderNumber = (
    database
      .prepare(
        `select max(orderNumber) as maxOrderNumber
          from BurialSiteTypeFields
          where recordDelete_timeMillis is null
          and burialSiteTypeId = ?`
      )
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
      .prepare(
        `update BurialSiteTypeFields
          set orderNumber = orderNumber - 1
          where recordDelete_timeMillis is null
          and burialSiteTypeId = ?
          and orderNumber > ?`
      )
      .run(currentField.burialSiteTypeId, currentField.orderNumber)
  }

  database.release()

  clearCacheByTableName('BurialSiteTypeFields')

  return true
}

export async function moveBurialSiteTypeFieldUp(
  burialSiteTypeFieldId: number | string
): Promise<boolean> {
  const database = await acquireConnection()

  const currentField = getCurrentField(burialSiteTypeFieldId, database)

  if (currentField.orderNumber <= 0) {
    database.release()
    return true
  }

  database
    .prepare(
      `update BurialSiteTypeFields
        set orderNumber = orderNumber + 1
        where recordDelete_timeMillis is null
        and burialSiteTypeId = ?
        and orderNumber = ? - 1`
    )
    .run(currentField.burialSiteTypeId, currentField.orderNumber)

  const success = updateRecordOrderNumber(
    'BurialSiteTypeFields',
    burialSiteTypeFieldId,
    currentField.orderNumber - 1,
    database
  )

  database.release()

  clearCacheByTableName('BurialSiteTypeFields')

  return success
}

export async function moveBurialSiteTypeFieldUpToTop(
  burialSiteTypeFieldId: number | string
): Promise<boolean> {
  const database = await acquireConnection()

  const currentField = getCurrentField(burialSiteTypeFieldId, database)

  if (currentField.orderNumber > 0) {
    updateRecordOrderNumber(
      'BurialSiteTypeFields',
      burialSiteTypeFieldId,
      -1,
      database
    )

    database
      .prepare(
        `update BurialSiteTypeFields
          set orderNumber = orderNumber + 1
          where recordDelete_timeMillis is null
          and burialSiteTypeId = ?
          and orderNumber < ?`
      )
      .run(currentField.burialSiteTypeId, currentField.orderNumber)
  }

  database.release()

  clearCacheByTableName('BurialSiteTypeFields')

  return true
}

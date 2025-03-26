import type sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/functions.cache.js'

import { acquireConnection } from './pool.js'
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

type RecordTable =
  | 'BurialSiteStatuses'
  | 'BurialSiteTypes'
  | 'ContractTypes'
  | 'FeeCategories'
  | 'WorkOrderMilestoneTypes'
  | 'WorkOrderTypes'

const recordIdColumns = new Map<RecordTable, string>([
  ['BurialSiteStatuses', 'burialSiteStatusId'],
  ['BurialSiteTypes', 'burialSiteTypeId'],
  ['ContractTypes', 'contractTypeId'],
  ['FeeCategories', 'feeCategoryId'],
  ['WorkOrderMilestoneTypes', 'workOrderMilestoneTypeId'],
  ['WorkOrderTypes', 'workOrderTypeId']
])

export async function moveRecordDown(
  recordTable: RecordTable,
  recordId: number | string
): Promise<boolean> {
  const database = await acquireConnection()

  const currentOrderNumber = getCurrentOrderNumber(
    recordTable,
    recordId,
    database
  )

  database
    .prepare(
      `update ${recordTable}
        set orderNumber = orderNumber - 1
        where recordDelete_timeMillis is null
        and orderNumber = ? + 1`
    )
    .run(currentOrderNumber)

  const success = updateRecordOrderNumber(
    recordTable,
    recordId,
    currentOrderNumber + 1,
    database
  )

  database.release()

  clearCacheByTableName(recordTable)

  return success
}

export async function moveRecordDownToBottom(
  recordTable: RecordTable,
  recordId: number | string
): Promise<boolean> {
  const database = await acquireConnection()

  const currentOrderNumber = getCurrentOrderNumber(
    recordTable,
    recordId,
    database
  )

  const maxOrderNumber = (
    database
      .prepare(
        `select max(orderNumber) as maxOrderNumber
          from ${recordTable}
          where recordDelete_timeMillis is null`
      )
      .get() as { maxOrderNumber: number }
  ).maxOrderNumber

  if (currentOrderNumber !== maxOrderNumber) {
    updateRecordOrderNumber(recordTable, recordId, maxOrderNumber + 1, database)

    database
      .prepare(
        `update ${recordTable}
          set orderNumber = orderNumber - 1
          where recordDelete_timeMillis is null
          and orderNumber > ?`
      )
      .run(currentOrderNumber)
  }

  database.release()

  clearCacheByTableName(recordTable)

  return true
}

export async function moveRecordUp(
  recordTable: RecordTable,
  recordId: number | string
): Promise<boolean> {
  const database = await acquireConnection()

  const currentOrderNumber = getCurrentOrderNumber(
    recordTable,
    recordId,
    database
  )

  if (currentOrderNumber <= 0) {
    database.release()
    return true
  }

  database
    .prepare(
      `update ${recordTable}
        set orderNumber = orderNumber + 1
        where recordDelete_timeMillis is null
        and orderNumber = ? - 1`
    )
    .run(currentOrderNumber)

  const success = updateRecordOrderNumber(
    recordTable,
    recordId,
    currentOrderNumber - 1,
    database
  )

  database.release()

  clearCacheByTableName(recordTable)

  return success
}

export async function moveRecordUpToTop(
  recordTable: RecordTable,
  recordId: number | string
): Promise<boolean> {
  const database = await acquireConnection()

  const currentOrderNumber = getCurrentOrderNumber(
    recordTable,
    recordId,
    database
  )

  if (currentOrderNumber > 0) {
    updateRecordOrderNumber(recordTable, recordId, -1, database)

    database
      .prepare(
        `update ${recordTable}
          set orderNumber = orderNumber + 1
          where recordDelete_timeMillis is null
          and orderNumber < ?`
      )
      .run(currentOrderNumber)
  }

  database.release()

  clearCacheByTableName(recordTable)

  return true
}

function getCurrentOrderNumber(
  recordTable: RecordTable,
  recordId: number | string,
  database: sqlite.Database
): number {
  const currentOrderNumber: number = (
    database
      .prepare(
        `select orderNumber
          from ${recordTable}
          where ${recordIdColumns.get(recordTable)} = ?`
      )
      .get(recordId) as { orderNumber: number }
  ).orderNumber

  return currentOrderNumber
}

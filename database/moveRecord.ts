import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

type RecordTable =
  | 'BurialSiteStatuses'
  | 'BurialSiteTypes'
  | 'CommittalTypes'
  | 'ContractTypes'
  | 'FeeCategories'
  | 'IntermentContainerTypes'
  | 'WorkOrderMilestoneTypes'
  | 'WorkOrderTypes'

const recordIdColumns = new Map<RecordTable, string>([
  ['BurialSiteStatuses', 'burialSiteStatusId'],
  ['BurialSiteTypes', 'burialSiteTypeId'],
  ['CommittalTypes', 'committalTypeId'],
  ['ContractTypes', 'contractTypeId'],
  ['FeeCategories', 'feeCategoryId'],
  ['IntermentContainerTypes', 'intermentContainerTypeId'],
  ['WorkOrderMilestoneTypes', 'workOrderMilestoneTypeId'],
  ['WorkOrderTypes', 'workOrderTypeId']
])

export function moveRecordDown(
  recordTable: RecordTable,
  recordId: number | string
): boolean {
  const database = sqlite(sunriseDB)

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

  database.close()

  clearCacheByTableName(recordTable)

  return success
}

export function moveRecordDownToBottom(
  recordTable: RecordTable,
  recordId: number | string
): boolean {
  const database = sqlite(sunriseDB)

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

  database.close()

  clearCacheByTableName(recordTable)

  return true
}

export function moveRecordUp(
  recordTable: RecordTable,
  recordId: number | string
): boolean {
  const database = sqlite(sunriseDB)

  const currentOrderNumber = getCurrentOrderNumber(
    recordTable,
    recordId,
    database
  )

  if (currentOrderNumber <= 0) {
    database.close()
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

  database.close()

  clearCacheByTableName(recordTable)

  return success
}

export function moveRecordUpToTop(
  recordTable: RecordTable,
  recordId: number | string
): boolean {
  const database = sqlite(sunriseDB)

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

  database.close()

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

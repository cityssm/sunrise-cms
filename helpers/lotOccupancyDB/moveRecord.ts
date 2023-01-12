import sqlite from 'better-sqlite3'

import { lotOccupancyDB as databasePath } from '../../data/databasePaths.js'
import { clearCacheByTableName } from '../functions.cache.js'
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js'

type RecordTable =
  | 'FeeCategories'
  | 'LotOccupantTypes'
  | 'LotStatuses'
  | 'LotTypes'
  | 'OccupancyTypes'
  | 'WorkOrderMilestoneTypes'
  | 'WorkOrderTypes'

const recordIdColumns: Map<RecordTable, string> = new Map()
recordIdColumns.set('FeeCategories', 'feeCategoryId')
recordIdColumns.set('LotOccupantTypes', 'lotOccupantTypeId')
recordIdColumns.set('LotStatuses', 'lotStatusId')
recordIdColumns.set('LotTypes', 'lotTypeId')
recordIdColumns.set('OccupancyTypes', 'occupancyTypeId')
recordIdColumns.set('WorkOrderMilestoneTypes', 'workOrderMilestoneTypeId')
recordIdColumns.set('WorkOrderTypes', 'workOrderTypeId')

function getCurrentOrderNumber(
  recordTable: RecordTable,
  recordId: number | string,
  database: sqlite.Database
): number {
  const currentOrderNumber: number = database
    .prepare(
      `select orderNumber
                from ${recordTable}
                where ${recordIdColumns.get(recordTable)!} = ?`
    )
    .get(recordId).orderNumber

  return currentOrderNumber
}

export function moveRecordDown(
  recordTable: RecordTable,
  recordId: number
): boolean {
  const database = sqlite(databasePath)

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
  recordId: number
): boolean {
  const database = sqlite(databasePath)

  const currentOrderNumber = getCurrentOrderNumber(
    recordTable,
    recordId,
    database
  )

  const maxOrderNumber: number = database
    .prepare(
      `select max(orderNumber) as maxOrderNumber
        from ${recordTable}
        where recordDelete_timeMillis is null`
    )
    .get().maxOrderNumber

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
  recordId: number
): boolean {
  const database = sqlite(databasePath)

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
  recordId: number
): boolean {
  const database = sqlite(databasePath)

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

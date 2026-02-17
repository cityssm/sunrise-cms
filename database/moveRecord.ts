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
  | 'ServiceTypes'
  | 'WorkOrderMilestoneTypes'
  | 'WorkOrderTypes'

const recordIdColumns = new Map<RecordTable, string>([
  ['BurialSiteStatuses', 'burialSiteStatusId'],
  ['BurialSiteTypes', 'burialSiteTypeId'],
  ['CommittalTypes', 'committalTypeId'],
  ['ContractTypes', 'contractTypeId'],
  ['FeeCategories', 'feeCategoryId'],
  ['IntermentContainerTypes', 'intermentContainerTypeId'],
  ['ServiceTypes', 'serviceTypeId'],
  ['WorkOrderMilestoneTypes', 'workOrderMilestoneTypeId'],
  ['WorkOrderTypes', 'workOrderTypeId']
])

export function moveRecordDown(
  recordTable: RecordTable,
  recordId: number | string,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const currentOrderNumber = getCurrentOrderNumber(
    recordTable,
    recordId,
    database
  )

  database
    .prepare(/* sql */ `
      UPDATE ${recordTable}
      SET
        orderNumber = orderNumber - 1
      WHERE
        recordDelete_timeMillis IS NULL
        AND orderNumber = ? + 1
    `)
    .run(currentOrderNumber)

  const success = updateRecordOrderNumber(
    recordTable,
    recordId,
    currentOrderNumber + 1,
    database
  )

  if (connectedDatabase === undefined) {
    database.close()
  }
  clearCacheByTableName(recordTable)

  return success
}

export function moveRecordDownToBottom(
  recordTable: RecordTable,
  recordId: number | string,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const currentOrderNumber = getCurrentOrderNumber(
    recordTable,
    recordId,
    database
  )

  const maxOrderNumber = (
    database
      .prepare(/* sql */ `
        SELECT
          max(orderNumber) AS maxOrderNumber
        FROM
          ${recordTable}
        WHERE
          recordDelete_timeMillis IS NULL
      `)
      .get() as { maxOrderNumber: number }
  ).maxOrderNumber

  if (currentOrderNumber !== maxOrderNumber) {
    updateRecordOrderNumber(recordTable, recordId, maxOrderNumber + 1, database)

    database
      .prepare(/* sql */ `
        UPDATE ${recordTable}
        SET
          orderNumber = orderNumber - 1
        WHERE
          recordDelete_timeMillis IS NULL
          AND orderNumber > ?
      `)
      .run(currentOrderNumber)
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
  clearCacheByTableName(recordTable)

  return true
}

export function moveRecordUp(
  recordTable: RecordTable,
  recordId: number | string,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const currentOrderNumber = getCurrentOrderNumber(
    recordTable,
    recordId,
    database
  )

  if (currentOrderNumber <= 0) {
    if (connectedDatabase === undefined) {
      database.close()
    }
    return true
  }

  database
    .prepare(/* sql */ `
      UPDATE ${recordTable}
      SET
        orderNumber = orderNumber + 1
      WHERE
        recordDelete_timeMillis IS NULL
        AND orderNumber = ? - 1
    `)
    .run(currentOrderNumber)

  const success = updateRecordOrderNumber(
    recordTable,
    recordId,
    currentOrderNumber - 1,
    database
  )

  if (connectedDatabase === undefined) {
    database.close()
  }
  clearCacheByTableName(recordTable)

  return success
}

export function moveRecordUpToTop(
  recordTable: RecordTable,
  recordId: number | string,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const currentOrderNumber = getCurrentOrderNumber(
    recordTable,
    recordId,
    database
  )

  if (currentOrderNumber > 0) {
    updateRecordOrderNumber(recordTable, recordId, -1, database)

    database
      .prepare(/* sql */ `
        UPDATE ${recordTable}
        SET
          orderNumber = orderNumber + 1
        WHERE
          recordDelete_timeMillis IS NULL
          AND orderNumber < ?
      `)
      .run(currentOrderNumber)
  }

  if (connectedDatabase === undefined) {
    database.close()
  }
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
      .prepare(/* sql */ `
        SELECT
          orderNumber
        FROM
          ${recordTable}
        WHERE
          ${recordIdColumns.get(recordTable)} = ?
      `)
      .get(recordId) as { orderNumber: number }
  ).orderNumber

  return currentOrderNumber
}

import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

type RecordTable =
  | 'BurialSiteStatuses'
  | 'WorkOrderMilestoneTypes'
  | 'WorkOrderTypes'

const recordNameColumns = new Map<RecordTable, string>([
  ['BurialSiteStatuses', 'burialSiteStatus'],
  ['WorkOrderMilestoneTypes', 'workOrderMilestoneType'],
  ['WorkOrderTypes', 'workOrderType']
])

function addRecord(
  record: {
    recordTable: RecordTable
    recordName: string
    orderNumber: number | string
  },
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(/* sql */ `insert into ${record.recordTable} (
        ${recordNameColumns.get(record.recordTable)},
        orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?)`
    )
    .run(
      record.recordName,
      record.orderNumber === '' ? -1 : record.orderNumber,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  if (connectedDatabase === undefined) {
    database.close()
  }
  clearCacheByTableName(record.recordTable)

  return result.lastInsertRowid as number
}

export function addBurialSiteStatus(
  burialSiteStatus: string,
  orderNumber: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  return addRecord(
    {
      recordTable: 'BurialSiteStatuses',
      recordName: burialSiteStatus,
      orderNumber
    },
    user,
    connectedDatabase
  )
}

export function addWorkOrderMilestoneType(
  workOrderMilestoneType: string,
  orderNumber: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  return addRecord(
    {
      recordTable: 'WorkOrderMilestoneTypes',
      recordName: workOrderMilestoneType,
      orderNumber
    },
    user,
    connectedDatabase
  )
}

export function addWorkOrderType(
  workOrderType: string,
  orderNumber: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  return addRecord(
    {
      recordTable: 'WorkOrderTypes',
      recordName: workOrderType,
      orderNumber
    },
    user,
    connectedDatabase
  )
}

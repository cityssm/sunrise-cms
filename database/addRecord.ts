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

export default function addRecord(
  recordTable: RecordTable,
  recordName: string,
  orderNumber: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `insert into ${recordTable} (
        ${recordNameColumns.get(recordTable)},
        orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?)`
    )
    .run(
      recordName,
      orderNumber === '' ? -1 : orderNumber,
      user.userName,
      rightNowMillis,
      user.userName,
      rightNowMillis
    )

  if (connectedDatabase === undefined) {
    database.close()
  }
  clearCacheByTableName(recordTable)

  return result.lastInsertRowid as number
}

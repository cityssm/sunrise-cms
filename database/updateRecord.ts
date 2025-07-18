import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

type RecordTable =
  | 'BurialSiteStatuses'
  | 'CommittalTypes'
  | 'WorkOrderMilestoneTypes'
  | 'WorkOrderTypes'

const recordNameIdColumns = new Map<RecordTable, string[]>([
  ['BurialSiteStatuses', ['burialSiteStatus', 'burialSiteStatusId']],
  ['CommittalTypes', ['committalType', 'committalTypeId']],
  [
    'WorkOrderMilestoneTypes',
    ['workOrderMilestoneType', 'workOrderMilestoneTypeId']
  ],
  ['WorkOrderTypes', ['workOrderType', 'workOrderTypeId']]
])

export function updateRecord(
  recordTable: RecordTable,
  recordId: number | string,
  recordName: string,
  user: User
): boolean {
  const database = sqlite(sunriseDB)

  const columnNames = recordNameIdColumns.get(recordTable)

  if (columnNames === undefined) {
    throw new Error(`Invalid record table: ${recordTable}`)
  }

  const result = database
    .prepare(
      `update ${recordTable}
        set ${columnNames[0]} = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and ${columnNames[1]} = ?`
    )
    .run(recordName, user.userName, Date.now(), recordId)

  database.close()

  clearCacheByTableName(recordTable)

  return result.changes > 0
}

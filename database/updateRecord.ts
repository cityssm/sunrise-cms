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

function updateRecord(
  record: {
    recordId: number | string
    recordName: string
    recordTable: RecordTable
  },
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const columnNames = recordNameIdColumns.get(record.recordTable)

  if (columnNames === undefined) {
    throw new Error(`Invalid record table: ${record.recordTable}`)
  }

  const result = database
    .prepare(
      `update ${record.recordTable}
        set ${columnNames[0]} = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and ${columnNames[1]} = ?`
    )
    .run(record.recordName, user.userName, Date.now(), record.recordId)

  if (connectedDatabase === undefined) {
    database.close()
  }

  clearCacheByTableName(record.recordTable)

  return result.changes > 0
}

export function updateBurialSiteStatus(
  burialSiteStatusId: number | string,
  burialSiteStatus: string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  return updateRecord(
    {
      recordId: burialSiteStatusId,
      recordName: burialSiteStatus,
      recordTable: 'BurialSiteStatuses'
    },
    user,
    connectedDatabase
  )
}

export function updateCommittalType(
  committalTypeId: number | string,
  committalType: string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  return updateRecord(
    {
      recordId: committalTypeId,
      recordName: committalType,
      recordTable: 'CommittalTypes'
    },
    user,
    connectedDatabase
  )
}

export function updateWorkOrderMilestoneType(
  workOrderMilestoneTypeId: number | string,
  workOrderMilestoneType: string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  return updateRecord(
    {
      recordId: workOrderMilestoneTypeId,
      recordName: workOrderMilestoneType,
      recordTable: 'WorkOrderMilestoneTypes'
    },
    user,
    connectedDatabase
  )
}

export function updateWorkOrderType(
  workOrderTypeId: number | string,
  workOrderType: string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  return updateRecord(
    {
      recordId: workOrderTypeId,
      recordName: workOrderType,
      recordTable: 'WorkOrderTypes'
    },
    user,
    connectedDatabase
  )
}

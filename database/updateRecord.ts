import getObjectDifference from '@cityssm/object-difference'
import sqlite from 'better-sqlite3'

import { clearCacheByTableName } from '../helpers/cache.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

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

const recordAuditInfo = new Map<
  RecordTable,
  {
    mainRecordType:
      | 'burialSiteStatus'
      | 'committalType'
      | 'workOrderMilestoneType'
      | 'workOrderType'
    recordIdColumn: string
  }
>([
  [
    'BurialSiteStatuses',
    { mainRecordType: 'burialSiteStatus', recordIdColumn: 'burialSiteStatusId' }
  ],
  [
    'CommittalTypes',
    { mainRecordType: 'committalType', recordIdColumn: 'committalTypeId' }
  ],
  [
    'WorkOrderMilestoneTypes',
    {
      mainRecordType: 'workOrderMilestoneType',
      recordIdColumn: 'workOrderMilestoneTypeId'
    }
  ],
  [
    'WorkOrderTypes',
    { mainRecordType: 'workOrderType', recordIdColumn: 'workOrderTypeId' }
  ]
])

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

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

  const auditInfo = recordAuditInfo.get(record.recordTable)

  const recordBefore =
    auditLogIsEnabled && auditInfo !== undefined
      ? database
          .prepare(
            /* sql */ `SELECT * FROM ${record.recordTable} WHERE ${auditInfo.recordIdColumn} = ? AND recordDelete_timeMillis IS NULL`
          )
          .get(record.recordId)
      : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE ${record.recordTable}
      SET
        ${columnNames[0]} = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND ${columnNames[1]} = ?
    `)
    .run(record.recordName, user.userName, Date.now(), record.recordId)

  if (result.changes > 0 && auditLogIsEnabled && auditInfo !== undefined) {
    const recordAfter = database
      .prepare(
        /* sql */ `SELECT * FROM ${record.recordTable} WHERE ${auditInfo.recordIdColumn} = ?`
      )
      .get(record.recordId)

    const differences = getObjectDifference(recordBefore, recordAfter)

    if (differences.length > 0) {
      createAuditLogEntries(
        {
          mainRecordType: auditInfo.mainRecordType,
          mainRecordId: record.recordId,
          updateTable: record.recordTable
        },
        differences,
        user,
        database
      )
    }
  }

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

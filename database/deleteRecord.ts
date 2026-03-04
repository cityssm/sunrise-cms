import sqlite from 'better-sqlite3'

import {
  type CacheTableNames,
  cacheTableNames,
  clearCacheByTableName
} from '../helpers/cache.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import createAuditLogEntries from './createAuditLogEntries.js'

type RecordTable =
  | 'BurialSiteComments'
  | 'BurialSiteStatuses'
  | 'BurialSiteTypeFields'
  | 'BurialSiteTypes'
  | 'CommittalTypes'
  | 'ContractAttachments'
  | 'ContractComments'
  | 'ContractTypeFields'
  | 'ContractTypes'
  | 'FeeCategories'
  | 'Fees'
  | 'IntermentContainerTypes'
  | 'IntermentDepths'
  | 'WorkOrderComments'
  | 'WorkOrderMilestones'
  | 'WorkOrderMilestoneTypes'
  | 'WorkOrders'
  | 'WorkOrderTypes'

const recordIdColumns = new Map<RecordTable, string>([
  ['BurialSiteComments', 'burialSiteCommentId'],
  ['BurialSiteStatuses', 'burialSiteStatusId'],
  ['BurialSiteTypeFields', 'burialSiteTypeFieldId'],
  ['BurialSiteTypes', 'burialSiteTypeId'],
  ['CommittalTypes', 'committalTypeId'],
  ['ContractAttachments', 'contractAttachmentId'],
  ['ContractComments', 'contractCommentId'],
  ['ContractTypeFields', 'contractTypeFieldId'],
  ['ContractTypes', 'contractTypeId'],
  ['FeeCategories', 'feeCategoryId'],
  ['Fees', 'feeId'],
  ['IntermentContainerTypes', 'intermentContainerTypeId'],
  ['IntermentDepths', 'intermentDepthId'],
  ['WorkOrderComments', 'workOrderCommentId'],
  ['WorkOrderMilestones', 'workOrderMilestoneId'],
  ['WorkOrderMilestoneTypes', 'workOrderMilestoneTypeId'],
  ['WorkOrders', 'workOrderId'],
  ['WorkOrderTypes', 'workOrderTypeId']
])

const relatedTables = new Map<RecordTable, string[]>([
  ['BurialSiteTypes', ['BurialSiteTypeFields']],
  ['ContractTypes', ['ContractTypePrints', 'ContractTypeFields']],
  [
    'WorkOrders',
    [
      'WorkOrderMilestones',
      'WorkOrderBurialSites',
      'WorkOrderContracts',
      'WorkOrderComments'
    ]
  ]
])

type ConfigRecordTable =
  | 'BurialSiteStatuses'
  | 'CommittalTypes'
  | 'IntermentContainerTypes'
  | 'IntermentDepths'
  | 'WorkOrderMilestoneTypes'
  | 'WorkOrderTypes'

const configTableAuditInfo = new Map<
  ConfigRecordTable,
  {
    mainRecordType:
      | 'burialSiteStatus'
      | 'committalType'
      | 'intermentContainerType'
      | 'intermentDepth'
      | 'workOrderMilestoneType'
      | 'workOrderType'
  }
>([
  ['BurialSiteStatuses', { mainRecordType: 'burialSiteStatus' }],
  ['CommittalTypes', { mainRecordType: 'committalType' }],
  ['IntermentContainerTypes', { mainRecordType: 'intermentContainerType' }],
  ['IntermentDepths', { mainRecordType: 'intermentDepth' }],
  ['WorkOrderMilestoneTypes', { mainRecordType: 'workOrderMilestoneType' }],
  ['WorkOrderTypes', { mainRecordType: 'workOrderType' }]
])

const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled')

export function deleteRecord(
  recordTable: RecordTable,
  recordId: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const configAuditInfo = configTableAuditInfo.get(
    recordTable as ConfigRecordTable
  )

  const recordBefore =
    auditLogIsEnabled && configAuditInfo !== undefined
      ? database
          .prepare(
            /* sql */ `SELECT * FROM ${recordTable} WHERE ${recordIdColumns.get(recordTable)} = ? AND recordDelete_timeMillis IS NULL`
          )
          .get(recordId)
      : undefined

  const result = database
    .prepare(/* sql */ `
      UPDATE ${recordTable}
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        ${recordIdColumns.get(recordTable)} = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(user.userName, rightNowMillis, recordId)

  for (const relatedTable of relatedTables.get(recordTable) ?? []) {
    database
      .prepare(/* sql */ `
        UPDATE ${relatedTable}
        SET
          recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        WHERE
          ${recordIdColumns.get(recordTable)} = ?
          AND recordDelete_timeMillis IS NULL
      `)
      .run(user.userName, rightNowMillis, recordId)
  }

  if (result.changes > 0 && auditLogIsEnabled && configAuditInfo !== undefined) {
    createAuditLogEntries(
      {
        mainRecordType: configAuditInfo.mainRecordType,
        mainRecordId: recordId,
        updateTable: recordTable as ConfigRecordTable
      },
      [
        {
          property: '*',
          type: 'deleted',
          from: recordBefore,
          to: undefined
        }
      ],
      user,
      database
    )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  // Clear cache for tables that are cached
  if (cacheTableNames.includes(recordTable as CacheTableNames)) {
    clearCacheByTableName(recordTable as CacheTableNames)
  }

  return result.changes > 0
}

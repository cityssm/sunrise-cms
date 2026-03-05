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
  | 'BurialSiteTypes'
  | 'CommittalTypes'
  | 'ContractTypes'
  | 'Fees'
  | 'IntermentContainerTypes'
  | 'IntermentDepths'
  | 'WorkOrderMilestoneTypes'
  | 'WorkOrders'
  | 'WorkOrderTypes'

const configTableAuditInfo = new Map<
  ConfigRecordTable,
  {
    mainRecordType:
      | 'burialSiteStatus'
      | 'burialSiteType'
      | 'committalType'
      | 'contractType'
      | 'fee'
      | 'intermentContainerType'
      | 'intermentDepth'
      | 'workOrder'
      | 'workOrderMilestoneType'
      | 'workOrderType'
  }
>([
  ['BurialSiteStatuses', { mainRecordType: 'burialSiteStatus' }],
  ['BurialSiteTypes', { mainRecordType: 'burialSiteType' }],
  ['CommittalTypes', { mainRecordType: 'committalType' }],
  ['ContractTypes', { mainRecordType: 'contractType' }],
  ['Fees', { mainRecordType: 'fee' }],
  ['IntermentContainerTypes', { mainRecordType: 'intermentContainerType' }],
  ['IntermentDepths', { mainRecordType: 'intermentDepth' }],
  ['WorkOrderMilestoneTypes', { mainRecordType: 'workOrderMilestoneType' }],
  ['WorkOrders', { mainRecordType: 'workOrder' }],
  ['WorkOrderTypes', { mainRecordType: 'workOrderType' }]
])

type ChildRecordTable =
  | 'BurialSiteComments'
  | 'ContractAttachments'
  | 'ContractComments'
  | 'WorkOrderComments'
  | 'WorkOrderMilestones'

const childTableAuditInfo = new Map<
  ChildRecordTable,
  {
    mainRecordType: 'burialSite' | 'contract' | 'workOrder'
    parentIdColumn: string
  }
>([
  [
    'BurialSiteComments',
    { mainRecordType: 'burialSite', parentIdColumn: 'burialSiteId' }
  ],
  [
    'ContractAttachments',
    { mainRecordType: 'contract', parentIdColumn: 'contractId' }
  ],
  [
    'ContractComments',
    { mainRecordType: 'contract', parentIdColumn: 'contractId' }
  ],
  [
    'WorkOrderComments',
    { mainRecordType: 'workOrder', parentIdColumn: 'workOrderId' }
  ],
  [
    'WorkOrderMilestones',
    { mainRecordType: 'workOrder', parentIdColumn: 'workOrderId' }
  ]
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

  const childAuditInfo = childTableAuditInfo.get(
    recordTable as ChildRecordTable
  )

  const recordBefore =
    auditLogIsEnabled &&
    (configAuditInfo !== undefined || childAuditInfo !== undefined)
      ? database
          .prepare(/* sql */ `
            SELECT
              *
            FROM
              ${recordTable}
            WHERE
              ${recordIdColumns.get(recordTable)} = ?
              AND recordDelete_timeMillis IS NULL
          `)
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

  if (result.changes > 0 && auditLogIsEnabled) {
    if (configAuditInfo !== undefined) {
      createAuditLogEntries(
        {
          mainRecordId: recordId,
          mainRecordType: configAuditInfo.mainRecordType,
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
    } else if (childAuditInfo !== undefined && recordBefore !== undefined) {
      const parentId = (recordBefore as Record<string, unknown>)[
        childAuditInfo.parentIdColumn
      ] as number | string

      createAuditLogEntries(
        {
          mainRecordId: parentId,
          mainRecordType: childAuditInfo.mainRecordType,
          recordIndex: recordId,
          updateTable: recordTable as ChildRecordTable
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

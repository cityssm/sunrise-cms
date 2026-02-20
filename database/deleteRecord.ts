import sqlite from 'better-sqlite3'

import {
  type CacheTableNames,
  cacheTableNames,
  clearCacheByTableName
} from '../helpers/cache.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

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

export function deleteRecord(
  recordTable: RecordTable,
  recordId: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const rightNowMillis = Date.now()

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

  if (connectedDatabase === undefined) {
    database.close()
  }

  // Clear cache for tables that are cached
  if (cacheTableNames.includes(recordTable as CacheTableNames)) {
    clearCacheByTableName(recordTable as CacheTableNames)
  }

  return result.changes > 0
}

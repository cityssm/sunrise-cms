import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import {
  type CacheTableNames,
  cacheTableNames,
  clearCacheByTableName
} from '../helpers/functions.cache.js'

type RecordTable =
  | 'BurialSiteComments'
  | 'BurialSiteStatuses'
  | 'BurialSiteTypeFields'
  | 'BurialSiteTypes'
  | 'CommittalTypes'
  | 'ContractComments'
  | 'Contracts'
  | 'ContractTypeFields'
  | 'ContractTypes'
  | 'FeeCategories'
  | 'Fees'
  | 'IntermentContainerTypes'
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
  ['ContractComments', 'contractCommentId'],
  ['Contracts', 'contractId'],
  ['ContractTypeFields', 'contractTypeFieldId'],
  ['ContractTypes', 'contractTypeId'],
  ['FeeCategories', 'feeCategoryId'],
  ['Fees', 'feeId'],
  ['IntermentContainerTypes', 'intermentContainerTypeId'],
  ['WorkOrderComments', 'workOrderCommentId'],
  ['WorkOrderMilestones', 'workOrderMilestoneId'],
  ['WorkOrderMilestoneTypes', 'workOrderMilestoneTypeId'],
  ['WorkOrders', 'workOrderId'],
  ['WorkOrderTypes', 'workOrderTypeId']
])

const relatedTables = new Map<RecordTable, string[]>([
  ['BurialSiteTypes', ['BurialSiteTypeFields']],
  ['Contracts', ['ContractFields', 'ContractComments']],
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
  user: User
): boolean {
  const database = sqlite(sunriseDB)

  const rightNowMillis = Date.now()

  const result = database
    .prepare(
      `update ${recordTable}
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where ${recordIdColumns.get(recordTable)} = ?
        and recordDelete_timeMillis is null`
    )
    .run(user.userName, rightNowMillis, recordId)

  for (const relatedTable of relatedTables.get(recordTable) ?? []) {
    database
      .prepare(
        `update ${relatedTable}
          set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
          where ${recordIdColumns.get(recordTable)} = ?
          and recordDelete_timeMillis is null`
      )
      .run(user.userName, rightNowMillis, recordId)
  }

  database.close()

  // Clear cache for tables that are cached
  if (cacheTableNames.includes(recordTable as CacheTableNames)) {
    clearCacheByTableName(recordTable as CacheTableNames)
  }

  return result.changes > 0
}

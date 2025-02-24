import type { PoolConnection } from 'better-sqlite-pool'

type RecordTable =
  | 'FeeCategories'
  | 'Fees'
  | 'BurialSiteStatuses'
  | 'BurialSiteTypes'
  | 'BurialSiteTypeFields'
  | 'ContractTypes'
  | 'ContractTypeFields'
  | 'WorkOrderMilestoneTypes'
  | 'WorkOrderTypes'

const recordIdColumns = new Map<RecordTable, string>()
recordIdColumns.set('FeeCategories', 'feeCategoryId')
recordIdColumns.set('Fees', 'feeId')
recordIdColumns.set('BurialSiteStatuses', 'burialSiteStatusId')
recordIdColumns.set('BurialSiteTypes', 'burialSiteTypeId')
recordIdColumns.set('BurialSiteTypeFields', 'burialSiteTypeFieldId')
recordIdColumns.set('ContractTypes', 'contractTypeId')
recordIdColumns.set('ContractTypeFields', 'contractTypeFieldId')
recordIdColumns.set('WorkOrderMilestoneTypes', 'workOrderMilestoneTypeId')
recordIdColumns.set('WorkOrderTypes', 'workOrderTypeId')

export function updateRecordOrderNumber(
  recordTable: RecordTable,
  recordId: number | string,
  orderNumber: number | string,
  connectedDatabase: PoolConnection
): boolean {
  const result = connectedDatabase
    .prepare(
      `update ${recordTable}
        set orderNumber = ?
        where recordDelete_timeMillis is null
        and ${recordIdColumns.get(recordTable)} = ?`
    )
    .run(orderNumber, recordId)

  return result.changes > 0
}

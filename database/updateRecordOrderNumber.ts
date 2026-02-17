import type sqlite from 'better-sqlite3'

type RecordTable =
  | 'BurialSiteStatuses'
  | 'BurialSiteTypeFields'
  | 'BurialSiteTypes'
  | 'CommittalTypes'
  | 'ContractTypeFields'
  | 'ContractTypes'
  | 'FeeCategories'
  | 'Fees'
  | 'IntermentContainerTypes'
  | 'ServiceTypes'
  | 'WorkOrderMilestoneTypes'
  | 'WorkOrderTypes'

const recordIdColumns = new Map<RecordTable, string>([
  ['BurialSiteStatuses', 'burialSiteStatusId'],
  ['BurialSiteTypeFields', 'burialSiteTypeFieldId'],
  ['BurialSiteTypes', 'burialSiteTypeId'],
  ['CommittalTypes', 'committalTypeId'],
  ['ContractTypeFields', 'contractTypeFieldId'],
  ['ContractTypes', 'contractTypeId'],
  ['FeeCategories', 'feeCategoryId'],
  ['Fees', 'feeId'],
  ['IntermentContainerTypes', 'intermentContainerTypeId'],
  ['ServiceTypes', 'serviceTypeId'],
  ['WorkOrderMilestoneTypes', 'workOrderMilestoneTypeId'],
  ['WorkOrderTypes', 'workOrderTypeId']
])

export function updateRecordOrderNumber(
  recordTable: RecordTable,
  recordId: number | string,
  orderNumber: number | string,
  connectedDatabase: sqlite.Database
): boolean {
  const result = connectedDatabase
    .prepare(/* sql */ `
      UPDATE ${recordTable}
      SET
        orderNumber = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND ${recordIdColumns.get(recordTable)} = ?
    `)
    .run(orderNumber, recordId)

  return result.changes > 0
}

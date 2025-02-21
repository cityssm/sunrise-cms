import { clearCacheByTableName } from '../helpers/functions.cache.js'

import { acquireConnection } from './pool.js'

type RecordTable =
  | 'BurialSiteStatuses'
  | 'BurialSiteTypes'
  | 'ContractTypes'
  | 'WorkOrderMilestoneTypes'
  | 'WorkOrderTypes'

const recordNameColumns = new Map<RecordTable, string>()
recordNameColumns.set('BurialSiteStatuses', 'burialSiteStatus')
recordNameColumns.set('BurialSiteTypes', 'burialSiteType')
recordNameColumns.set('ContractTypes', 'contractType')
recordNameColumns.set('WorkOrderMilestoneTypes', 'workOrderMilestoneType')
recordNameColumns.set('WorkOrderTypes', 'workOrderType')

export default async function addRecord(
  recordTable: RecordTable,
  recordName: string,
  orderNumber: number | string,
  user: User
): Promise<number> {
  const database = await acquireConnection()

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

  database.release()

  clearCacheByTableName(recordTable)

  return result.lastInsertRowid as number
}

import { clearCacheByTableName } from '../helpers/functions.cache.js'

import { acquireConnection } from './pool.js'

type RecordTable =
  | 'BurialSiteStatuses'
  | 'BurialSiteTypes'
  | 'WorkOrderMilestoneTypes'
  | 'WorkOrderTypes'

const recordNameIdColumns = new Map<RecordTable, string[]>([
  ['BurialSiteStatuses', ['burialSiteStatus', 'burialSiteStatusId']],
  ['BurialSiteTypes', ['burialSiteType', 'burialSiteTypeId']],
  [
    'WorkOrderMilestoneTypes',
    ['workOrderMilestoneType', 'workOrderMilestoneTypeId']
  ],
  ['WorkOrderTypes', ['workOrderType', 'workOrderTypeId']]
])

export async function updateRecord(
  recordTable: RecordTable,
  recordId: number | string,
  recordName: string,
  user: User
): Promise<boolean> {
  const database = await acquireConnection()

  const result = database
    .prepare(
      `update ${recordTable}
        set ${recordNameIdColumns.get(recordTable)![0]} = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and ${recordNameIdColumns.get(recordTable)![1]} = ?`
    )
    .run(recordName, user.userName, Date.now(), recordId)

  database.release()

  clearCacheByTableName(recordTable)

  return result.changes > 0
}

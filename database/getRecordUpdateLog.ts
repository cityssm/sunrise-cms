import { daysToMillis } from '@cityssm/to-millis'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

const maxDays = 30

export const defaultRecordLimit = 100
const maxRecordLimit = 500

export type RecordType = 'contract' | 'contractTransactions' | 'workOrder' | 'workOrderMilestone'

export interface RecordUpdateLog {
  recordType: RecordType
  updateType: 'create' | 'update'

  displayRecordId: string
  recordId: number

  recordDescription: number

  recordUpdate_timeMillis: number
  recordUpdate_userName: string
}

export default function getRecordUpdateLog(
  filters: {
    recordType: '' | RecordType
  },
  options?: {
    limit?: number
    offset?: number
  }
): RecordUpdateLog[] {
  const minimumMillis = Date.now() - daysToMillis(maxDays)

  const database = sqlite(sunriseDB, { readonly: true })

  const recordTableSql: string[] = []

  if (filters.recordType === '' || filters.recordType === 'contract') {
    recordTableSql.push(`select 'contract' as recordType,
        case when r.recordCreate_timeMillis <= r.recordUpdate_timeMillis
          then 'create'
          else 'update' end as updateType,
        r.contractId as displayRecordId,
        r.contractId as recordId,
        t.contractType as recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName
      from Contracts r
      left join ContractTypes t on r.contractTypeId = t.contractTypeId
      where r.recordDelete_timeMillis is null
        and r.recordUpdate_timeMillis >= @minimumMillis`)
  }

  if (filters.recordType === '' || filters.recordType === 'contract' || filters.recordType === 'contractTransactions') {
    recordTableSql.push(`select 'contractTransactions' as recordType,
        case when r.recordCreate_timeMillis = r.recordUpdate_timeMillis
          then 'create'
          else 'update' end as updateType,
        r.contractId as displayRecordId,
        r.contractId as recordId,
        r.transactionNote as recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName
      from ContractTransactions r
      where r.recordDelete_timeMillis is null
        and r.recordUpdate_timeMillis >= @minimumMillis`)
  }

  if (filters.recordType === '' || filters.recordType === 'workOrder') {
    recordTableSql.push(`select 'workOrder' as recordType,
        case when r.recordCreate_timeMillis = r.recordUpdate_timeMillis
          then 'create'
          else 'update' end as updateType,
        workOrderNumber as displayRecordId,
        workOrderId as recordId,
        workOrderDescription as recordDescription,
        recordUpdate_timeMillis,
        recordUpdate_userName
      from WorkOrders r
      where r.recordDelete_timeMillis is null
        and r.recordUpdate_timeMillis >= @minimumMillis`)
  }

  if (filters.recordType === '' || filters.recordType === 'workOrder' || filters.recordType === 'workOrderMilestone') {
    recordTableSql.push(`select 'workOrderMilestone' as recordType,
        case when r.recordCreate_timeMillis = r.recordUpdate_timeMillis
          then 'create'
          else 'update' end as updateType,
        workOrderNumber as displayRecordId,
        r.workOrderId as recordId,
        case when mt.workOrderMilestoneType is null
          then ''
          else mt.workOrderMilestoneType || ' - ' end || r.workOrderMilestoneDescription as recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName
      from WorkOrderMilestones r
      left join WorkOrderMilestoneTypes mt on r.workOrderMilestoneTypeId = mt.workOrderMilestoneTypeId
      left join WorkOrders w on r.workOrderId = w.workOrderId
      where r.recordDelete_timeMillis is null
        and w.recordDelete_timeMillis is null
        and r.recordUpdate_timeMillis >= @minimumMillis`)
  }

  const limit = Math.min(options?.limit ?? defaultRecordLimit, maxRecordLimit)
  const offset = options?.offset ?? 0

  const result = database
    .prepare(
      `${recordTableSql.join(' union all ')}

        order by r.recordUpdate_timeMillis desc
        limit @limit offset @offset`
    )
    .all({
      minimumMillis,

      limit,
      offset
    }) as RecordUpdateLog[]

  database.close()

  return result
}

import { daysToMillis } from '@cityssm/to-millis'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

const maxDays = 30

export const defaultRecordLimit = 100
const maxRecordLimit = 500

export type RecordType =
  | 'burialSite'
  | 'burialSiteComment'
  | 'comments'
  | 'contract'
  | 'contractComment'
  | 'contractFee'
  | 'contractTransactions'
  | 'workOrder'
  | 'workOrderComment'
  | 'workOrderMilestone'

export interface RecordUpdateLog {
  recordType: RecordType
  updateType: 'create' | 'update'

  displayRecordId: string
  recordId: number

  recordDescription: string

  recordCreate_timeMillis: number
  recordCreate_userName: string
  recordUpdate_timeMillis: number
  recordUpdate_userName: string
}

// eslint-disable-next-line complexity
export default function getRecordUpdateLog(
  filters: {
    recordType: '' | RecordType
  },
  options?: {
    limit?: number
    offset?: number
    sortBy?: 'recordCreate_timeMillis' | 'recordUpdate_timeMillis'
    sortDirection?: 'asc' | 'desc'
  },
  connectedDatabase?: sqlite.Database
): RecordUpdateLog[] {
  const minimumMillis = Date.now() - daysToMillis(maxDays)

  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const recordTableSql: string[] = []

  if (filters.recordType === '' || filters.recordType === 'contract') {
    recordTableSql.push(`select 'contract' as recordType,
        case when r.recordCreate_timeMillis = r.recordUpdate_timeMillis
          then 'create'
          else 'update' end as updateType,
        r.contractId as displayRecordId,
        r.contractId as recordId,
        coalesce(t.contractType, 'Contract') as recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      from Contracts r
      left join ContractTypes t on r.contractTypeId = t.contractTypeId
      where r.recordDelete_timeMillis is null
        and r.recordUpdate_timeMillis >= @minimumMillis`)
  }

  if (
    filters.recordType === '' ||
    filters.recordType === 'contract' ||
    filters.recordType === 'contractTransactions'
  ) {
    recordTableSql.push(`select 'contractTransactions' as recordType,
        case when r.recordCreate_timeMillis = r.recordUpdate_timeMillis
          then 'create'
          else 'update' end as updateType,
        r.contractId as displayRecordId,
        r.contractId as recordId,
        case when r.transactionNote is not null and r.transactionNote != ''
          then r.transactionNote
          else 'Transaction: $' || printf('%.2f', r.transactionAmount) end as recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
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
        case when r.workOrderDescription is not null and r.workOrderDescription != ''
          then r.workOrderDescription
          else coalesce(t.workOrderType, 'Work Order') end as recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      from WorkOrders r
      left join WorkOrderTypes t on r.workOrderTypeId = t.workOrderTypeId
      where r.recordDelete_timeMillis is null
        and r.recordUpdate_timeMillis >= @minimumMillis`)
  }

  if (
    filters.recordType === '' ||
    filters.recordType === 'workOrder' ||
    filters.recordType === 'workOrderMilestone'
  ) {
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
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      from WorkOrderMilestones r
      left join WorkOrderMilestoneTypes mt on r.workOrderMilestoneTypeId = mt.workOrderMilestoneTypeId
      left join WorkOrders w on r.workOrderId = w.workOrderId
      where r.recordDelete_timeMillis is null
        and w.recordDelete_timeMillis is null
        and r.recordUpdate_timeMillis >= @minimumMillis`)
  }

  // Burial Sites
  if (filters.recordType === '' || filters.recordType === 'burialSite') {
    recordTableSql.push(`select 'burialSite' as recordType,
        case when r.recordCreate_timeMillis = r.recordUpdate_timeMillis
          then 'create'
          else 'update' end as updateType,
        r.burialSiteName as displayRecordId,
        r.burialSiteId as recordId,
        coalesce(t.burialSiteType, 'Burial Site') || 
        case when s.burialSiteStatus is not null then ' (' || s.burialSiteStatus || ')' else '' end as recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      from BurialSites r
      left join BurialSiteTypes t on r.burialSiteTypeId = t.burialSiteTypeId
      left join BurialSiteStatuses s on r.burialSiteStatusId = s.burialSiteStatusId
      where r.recordDelete_timeMillis is null
        and r.recordUpdate_timeMillis >= @minimumMillis`)
  }

  // Contract Fees
  if (
    filters.recordType === '' ||
    filters.recordType === 'contract' ||
    filters.recordType === 'contractFee'
  ) {
    recordTableSql.push(`select 'contractFee' as recordType,
        case when r.recordCreate_timeMillis = r.recordUpdate_timeMillis
          then 'create'
          else 'update' end as updateType,
        r.contractId as displayRecordId,
        r.contractId as recordId,
        'Contract Fee: ' || coalesce(f.feeName, 'Unknown Fee') || ' ($' || printf('%.2f', r.feeAmount) || ')' as recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      from ContractFees r
      left join Fees f on r.feeId = f.feeId
      where r.recordDelete_timeMillis is null
        and r.recordUpdate_timeMillis >= @minimumMillis`)
  }

  // Comments - Contract Comments
  if (
    filters.recordType === '' ||
    filters.recordType === 'comments' ||
    filters.recordType === 'contractComment'
  ) {
    recordTableSql.push(`select 'contractComment' as recordType,
        case when r.recordCreate_timeMillis = r.recordUpdate_timeMillis
          then 'create'
          else 'update' end as updateType,
        r.contractId as displayRecordId,
        r.contractId as recordId,
        'Contract Comment: ' || substr(r.comment, 1, 100) || 
        case when length(r.comment) > 100 then '...' else '' end as recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      from ContractComments r
      where r.recordDelete_timeMillis is null
        and r.recordUpdate_timeMillis >= @minimumMillis`)
  }

  // Comments - Work Order Comments
  if (
    filters.recordType === '' ||
    filters.recordType === 'comments' ||
    filters.recordType === 'workOrderComment'
  ) {
    recordTableSql.push(`select 'workOrderComment' as recordType,
        case when r.recordCreate_timeMillis = r.recordUpdate_timeMillis
          then 'create'
          else 'update' end as updateType,
        w.workOrderNumber as displayRecordId,
        r.workOrderId as recordId,
        'Work Order Comment: ' || substr(r.comment, 1, 100) || 
        case when length(r.comment) > 100 then '...' else '' end as recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      from WorkOrderComments r
      left join WorkOrders w on r.workOrderId = w.workOrderId
      where r.recordDelete_timeMillis is null
        and w.recordDelete_timeMillis is null
        and r.recordUpdate_timeMillis >= @minimumMillis`)
  }

  // Comments - Burial Site Comments
  if (
    filters.recordType === '' ||
    filters.recordType === 'comments' ||
    filters.recordType === 'burialSiteComment'
  ) {
    recordTableSql.push(`select 'burialSiteComment' as recordType,
        case when r.recordCreate_timeMillis = r.recordUpdate_timeMillis
          then 'create'
          else 'update' end as updateType,
        b.burialSiteName as displayRecordId,
        r.burialSiteId as recordId,
        'Burial Site Comment: ' || substr(r.comment, 1, 100) || 
        case when length(r.comment) > 100 then '...' else '' end as recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      from BurialSiteComments r
      left join BurialSites b on r.burialSiteId = b.burialSiteId
      where r.recordDelete_timeMillis is null
        and b.recordDelete_timeMillis is null
        and r.recordUpdate_timeMillis >= @minimumMillis`)
  }

  const limit = Math.min(options?.limit ?? defaultRecordLimit, maxRecordLimit)
  const offset = options?.offset ?? 0
  const sortBy = options?.sortBy ?? 'recordUpdate_timeMillis'
  const sortDirection = options?.sortDirection ?? 'desc'

  const result = database
    .prepare(
      `
        select recordType, updateType, displayRecordId, recordId, recordDescription,
        recordUpdate_timeMillis, recordUpdate_userName, recordCreate_timeMillis, recordCreate_userName
        from (${recordTableSql.join(' union all ')})

        order by ${sortBy} ${sortDirection}
        limit @limit offset @offset`
    )
    .all({
      minimumMillis,

      limit,
      offset
    }) as RecordUpdateLog[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result
}

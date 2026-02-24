import { daysToMillis } from '@cityssm/to-millis'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

const maxDays = 30

export const defaultRecordLimit = 100
const maxRecordLimit = 10_000

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

const allowedSortBy = [
  'recordCreate_timeMillis',
  'recordUpdate_timeMillis'
] as const
const allowedSortDirection = ['asc', 'desc'] as const

// eslint-disable-next-line complexity
export default function getRecordUpdateLog(
  filters: {
    recordType: '' | RecordType
  },
  options?: {
    limit?: number
    offset?: number
    sortBy?: (typeof allowedSortBy)[number]
    sortDirection?: (typeof allowedSortDirection)[number]
  },
  connectedDatabase?: sqlite.Database
): RecordUpdateLog[] {
  const minimumMillis = Date.now() - daysToMillis(maxDays)

  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const recordTableSql: string[] = []

  if (filters.recordType === '' || filters.recordType === 'contract') {
    recordTableSql.push(/* sql */ `
      SELECT
        'contract' AS recordType,
        CASE
          WHEN r.recordCreate_timeMillis = r.recordUpdate_timeMillis THEN 'create'
          ELSE 'update'
        END AS updateType,
        r.contractId AS displayRecordId,
        r.contractId AS recordId,
        coalesce(t.contractType, 'Contract') AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      FROM
        Contracts r
        LEFT JOIN ContractTypes t ON r.contractTypeId = t.contractTypeId
      WHERE
        r.recordDelete_timeMillis IS NULL
        AND r.recordUpdate_timeMillis >= @minimumMillis
    `)
  }

  if (
    filters.recordType === '' ||
    filters.recordType === 'contract' ||
    filters.recordType === 'contractTransactions'
  ) {
    recordTableSql.push(/* sql */ `
      SELECT
        'contractTransactions' AS recordType,
        CASE
          WHEN r.recordCreate_timeMillis = r.recordUpdate_timeMillis THEN 'create'
          ELSE 'update'
        END AS updateType,
        r.contractId AS displayRecordId,
        r.contractId AS recordId,
        CASE
          WHEN r.transactionNote IS NOT NULL
          AND r.transactionNote != '' THEN r.transactionNote
          ELSE 'Transaction: $' || printf('%.2f', r.transactionAmount)
        END AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      FROM
        ContractTransactions r
      WHERE
        r.recordDelete_timeMillis IS NULL
        AND r.recordUpdate_timeMillis >= @minimumMillis
    `)
  }

  if (filters.recordType === '' || filters.recordType === 'workOrder') {
    recordTableSql.push(/* sql */ `
      SELECT
        'workOrder' AS recordType,
        CASE
          WHEN r.recordCreate_timeMillis = r.recordUpdate_timeMillis THEN 'create'
          ELSE 'update'
        END AS updateType,
        workOrderNumber AS displayRecordId,
        workOrderId AS recordId,
        CASE
          WHEN r.workOrderDescription IS NOT NULL
          AND r.workOrderDescription != '' THEN r.workOrderDescription
          ELSE coalesce(t.workOrderType, 'Work Order')
        END AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      FROM
        WorkOrders r
        LEFT JOIN WorkOrderTypes t ON r.workOrderTypeId = t.workOrderTypeId
      WHERE
        r.recordDelete_timeMillis IS NULL
        AND r.recordUpdate_timeMillis >= @minimumMillis
    `)
  }

  if (
    filters.recordType === '' ||
    filters.recordType === 'workOrder' ||
    filters.recordType === 'workOrderMilestone'
  ) {
    recordTableSql.push(/* sql */ `
      SELECT
        'workOrderMilestone' AS recordType,
        CASE
          WHEN r.recordCreate_timeMillis = r.recordUpdate_timeMillis THEN 'create'
          ELSE 'update'
        END AS updateType,
        workOrderNumber AS displayRecordId,
        r.workOrderId AS recordId,
        CASE
          WHEN mt.workOrderMilestoneType IS NULL THEN ''
          ELSE mt.workOrderMilestoneType || ' - '
        END || r.workOrderMilestoneDescription AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      FROM
        WorkOrderMilestones r
        LEFT JOIN WorkOrderMilestoneTypes mt ON r.workOrderMilestoneTypeId = mt.workOrderMilestoneTypeId
        LEFT JOIN WorkOrders w ON r.workOrderId = w.workOrderId
      WHERE
        r.recordDelete_timeMillis IS NULL
        AND w.recordDelete_timeMillis IS NULL
        AND r.recordUpdate_timeMillis >= @minimumMillis
    `)
  }

  // Burial Sites
  if (filters.recordType === '' || filters.recordType === 'burialSite') {
    recordTableSql.push(/* sql */ `
      SELECT
        'burialSite' AS recordType,
        CASE
          WHEN r.recordCreate_timeMillis = r.recordUpdate_timeMillis THEN 'create'
          ELSE 'update'
        END AS updateType,
        r.burialSiteName AS displayRecordId,
        r.burialSiteId AS recordId,
        coalesce(t.burialSiteType, 'Burial Site') || CASE
          WHEN s.burialSiteStatus IS NOT NULL THEN ' (' || s.burialSiteStatus || ')'
          ELSE ''
        END AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      FROM
        BurialSites r
        LEFT JOIN BurialSiteTypes t ON r.burialSiteTypeId = t.burialSiteTypeId
        LEFT JOIN BurialSiteStatuses s ON r.burialSiteStatusId = s.burialSiteStatusId
      WHERE
        r.recordDelete_timeMillis IS NULL
        AND r.recordUpdate_timeMillis >= @minimumMillis
    `)
  }

  // Contract Fees
  if (
    filters.recordType === '' ||
    filters.recordType === 'contract' ||
    filters.recordType === 'contractFee'
  ) {
    recordTableSql.push(/* sql */ `
      SELECT
        'contractFee' AS recordType,
        CASE
          WHEN r.recordCreate_timeMillis = r.recordUpdate_timeMillis THEN 'create'
          ELSE 'update'
        END AS updateType,
        r.contractId AS displayRecordId,
        r.contractId AS recordId,
        'Contract Fee: ' || coalesce(f.feeName, 'Unknown Fee') || ' ($' || printf('%.2f', r.feeAmount) || ')' AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      FROM
        ContractFees r
        LEFT JOIN Fees f ON r.feeId = f.feeId
      WHERE
        r.recordDelete_timeMillis IS NULL
        AND r.recordUpdate_timeMillis >= @minimumMillis
    `)
  }

  // Comments - Contract Comments
  if (
    filters.recordType === '' ||
    filters.recordType === 'comments' ||
    filters.recordType === 'contractComment'
  ) {
    recordTableSql.push(/* sql */ `
      SELECT
        'contractComment' AS recordType,
        CASE
          WHEN r.recordCreate_timeMillis = r.recordUpdate_timeMillis THEN 'create'
          ELSE 'update'
        END AS updateType,
        r.contractId AS displayRecordId,
        r.contractId AS recordId,
        'Contract Comment: ' || substr(r.comment, 1, 100) || CASE
          WHEN length(r.comment) > 100 THEN '...'
          ELSE ''
        END AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      FROM
        ContractComments r
      WHERE
        r.recordDelete_timeMillis IS NULL
        AND r.recordUpdate_timeMillis >= @minimumMillis
    `)
  }

  // Comments - Work Order Comments
  if (
    filters.recordType === '' ||
    filters.recordType === 'comments' ||
    filters.recordType === 'workOrderComment'
  ) {
    recordTableSql.push(/* sql */ `
      SELECT
        'workOrderComment' AS recordType,
        CASE
          WHEN r.recordCreate_timeMillis = r.recordUpdate_timeMillis THEN 'create'
          ELSE 'update'
        END AS updateType,
        w.workOrderNumber AS displayRecordId,
        r.workOrderId AS recordId,
        'Work Order Comment: ' || substr(r.comment, 1, 100) || CASE
          WHEN length(r.comment) > 100 THEN '...'
          ELSE ''
        END AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      FROM
        WorkOrderComments r
        LEFT JOIN WorkOrders w ON r.workOrderId = w.workOrderId
      WHERE
        r.recordDelete_timeMillis IS NULL
        AND w.recordDelete_timeMillis IS NULL
        AND r.recordUpdate_timeMillis >= @minimumMillis
    `)
  }

  // Comments - Burial Site Comments
  if (
    filters.recordType === '' ||
    filters.recordType === 'comments' ||
    filters.recordType === 'burialSiteComment'
  ) {
    recordTableSql.push(/* sql */ `
      SELECT
        'burialSiteComment' AS recordType,
        CASE
          WHEN r.recordCreate_timeMillis = r.recordUpdate_timeMillis THEN 'create'
          ELSE 'update'
        END AS updateType,
        b.burialSiteName AS displayRecordId,
        r.burialSiteId AS recordId,
        'Burial Site Comment: ' || substr(r.comment, 1, 100) || CASE
          WHEN length(r.comment) > 100 THEN '...'
          ELSE ''
        END AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_userName,
        r.recordCreate_timeMillis,
        r.recordCreate_userName
      FROM
        BurialSiteComments r
        LEFT JOIN BurialSites b ON r.burialSiteId = b.burialSiteId
      WHERE
        r.recordDelete_timeMillis IS NULL
        AND b.recordDelete_timeMillis IS NULL
        AND r.recordUpdate_timeMillis >= @minimumMillis
    `)
  }

  const limit = Math.min(options?.limit ?? defaultRecordLimit, maxRecordLimit)
  const offset = options?.offset ?? 0

  let sortBy = options?.sortBy ?? 'recordUpdate_timeMillis'
  if (!allowedSortBy.includes(sortBy)) {
    sortBy = 'recordUpdate_timeMillis'
  }

  let sortDirection = options?.sortDirection ?? 'desc'
  if (!allowedSortDirection.includes(sortDirection)) {
    sortDirection = 'desc'
  }

  const result = database
    .prepare(/* sql */ `
      SELECT
        recordType,
        updateType,
        displayRecordId,
        recordId,
        recordDescription,
        recordUpdate_timeMillis,
        recordUpdate_userName,
        recordCreate_timeMillis,
        recordCreate_userName
      FROM
        (${recordTableSql.join(' union all ')})
      ORDER BY
        ${sortBy} ${sortDirection}
      LIMIT
        @limit
      OFFSET
        @offset
    `)
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

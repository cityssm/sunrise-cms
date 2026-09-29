import { DatabaseSync } from 'node:sqlite'

import { daysToMillis } from '@cityssm/to-millis'

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
  recordCreate_username: string
  recordUpdate_timeMillis: number
  recordUpdate_username: string
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
  connectedDatabase?: DatabaseSync
): RecordUpdateLog[] {
  const minimumMillis = Date.now() - daysToMillis(maxDays)

  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const recordTableSql: string[] = []

  if (filters.recordType === '' || filters.recordType === 'contract') {
    recordTableSql.push(/* sql */ `
      SELECT
        'contract' AS recordType,
        CASE
          WHEN r.recordCreate_timeMillis = r.recordUpdate_timeMillis THEN 'create'
          ELSE 'update'
        END AS updateType,
        r.contractNumber AS displayRecordId,
        r.contractId AS recordId,
        COALESCE(t.contractType, 'Contract') AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_username,
        r.recordCreate_timeMillis,
        r.recordCreate_username
      FROM
        Contracts r
        LEFT JOIN ContractTypes t ON r.contractTypeId = t.contractTypeId
      WHERE
        r.recordDelete_timeMillis IS NULL
        AND r.recordUpdate_timeMillis >= @minimumMillis
    `)
  }

  if (['', 'contract', 'contractTransactions'].includes(filters.recordType)) {
    recordTableSql.push(/* sql */ `
      SELECT
        'contractTransactions' AS recordType,
        CASE
          WHEN r.recordCreate_timeMillis = r.recordUpdate_timeMillis THEN 'create'
          ELSE 'update'
        END AS updateType,
        c.contractNumber AS displayRecordId,
        r.contractId AS recordId,
        CASE
          WHEN r.transactionNote IS NOT NULL
          AND r.transactionNote != '' THEN r.transactionNote
          ELSE 'Transaction: $' || PRINTF('%.2f', r.transactionAmount)
        END AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_username,
        r.recordCreate_timeMillis,
        r.recordCreate_username
      FROM
        ContractTransactions r
        LEFT JOIN Contracts c ON r.contractId = c.contractId
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
          ELSE COALESCE(t.workOrderType, 'Work Order')
        END AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_username,
        r.recordCreate_timeMillis,
        r.recordCreate_username
      FROM
        WorkOrders r
        LEFT JOIN WorkOrderTypes t ON r.workOrderTypeId = t.workOrderTypeId
      WHERE
        r.recordDelete_timeMillis IS NULL
        AND r.recordUpdate_timeMillis >= @minimumMillis
    `)
  }

  if (['', 'workOrder', 'workOrderMilestone'].includes(filters.recordType)) {
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
        r.recordUpdate_username,
        r.recordCreate_timeMillis,
        r.recordCreate_username
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
        COALESCE(t.burialSiteType, 'Burial Site') || CASE
          WHEN s.burialSiteStatus IS NOT NULL THEN ' (' || s.burialSiteStatus || ')'
          ELSE ''
        END AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_username,
        r.recordCreate_timeMillis,
        r.recordCreate_username
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
  if (['', 'contract', 'contractFee'].includes(filters.recordType)) {
    recordTableSql.push(/* sql */ `
      SELECT
        'contractFee' AS recordType,
        CASE
          WHEN r.recordCreate_timeMillis = r.recordUpdate_timeMillis THEN 'create'
          ELSE 'update'
        END AS updateType,
        c.contractNumber AS displayRecordId,
        r.contractId AS recordId,
        'Contract Fee: ' || COALESCE(f.feeName, 'Unknown Fee') || ' ($' || PRINTF('%.2f', r.feeAmount) || ')' AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_username,
        r.recordCreate_timeMillis,
        r.recordCreate_username
      FROM
        ContractFees r
        LEFT JOIN Fees f ON r.feeId = f.feeId
        LEFT JOIN Contracts c ON r.contractId = c.contractId
      WHERE
        r.recordDelete_timeMillis IS NULL
        AND r.recordUpdate_timeMillis >= @minimumMillis
    `)
  }

  // Comments - Contract Comments
  if (['', 'comments', 'contractComment'].includes(filters.recordType)) {
    recordTableSql.push(/* sql */ `
      SELECT
        'contractComment' AS recordType,
        CASE
          WHEN r.recordCreate_timeMillis = r.recordUpdate_timeMillis THEN 'create'
          ELSE 'update'
        END AS updateType,
        c.contractNumber AS displayRecordId,
        r.contractId AS recordId,
        'Contract Comment: ' || SUBSTR(r.comment, 1, 100) || CASE
          WHEN LENGTH(r.comment) > 100 THEN '...'
          ELSE ''
        END AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_username,
        r.recordCreate_timeMillis,
        r.recordCreate_username
      FROM
        ContractComments r
        LEFT JOIN Contracts c ON r.contractId = c.contractId
      WHERE
        r.recordDelete_timeMillis IS NULL
        AND r.recordUpdate_timeMillis >= @minimumMillis
    `)
  }

  // Comments - Work Order Comments
  if (['', 'comments', 'workOrderComment'].includes(filters.recordType)) {
    recordTableSql.push(/* sql */ `
      SELECT
        'workOrderComment' AS recordType,
        CASE
          WHEN r.recordCreate_timeMillis = r.recordUpdate_timeMillis THEN 'create'
          ELSE 'update'
        END AS updateType,
        w.workOrderNumber AS displayRecordId,
        r.workOrderId AS recordId,
        'Work Order Comment: ' || SUBSTR(r.comment, 1, 100) || CASE
          WHEN LENGTH(r.comment) > 100 THEN '...'
          ELSE ''
        END AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_username,
        r.recordCreate_timeMillis,
        r.recordCreate_username
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
  if (['', 'burialSiteComment', 'comments'].includes(filters.recordType)) {
    recordTableSql.push(/* sql */ `
      SELECT
        'burialSiteComment' AS recordType,
        CASE
          WHEN r.recordCreate_timeMillis = r.recordUpdate_timeMillis THEN 'create'
          ELSE 'update'
        END AS updateType,
        b.burialSiteName AS displayRecordId,
        r.burialSiteId AS recordId,
        'Burial Site Comment: ' || SUBSTR(r.comment, 1, 100) || CASE
          WHEN LENGTH(r.comment) > 100 THEN '...'
          ELSE ''
        END AS recordDescription,
        r.recordUpdate_timeMillis,
        r.recordUpdate_username,
        r.recordCreate_timeMillis,
        r.recordCreate_username
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
    // eslint-disable-next-line sqlite-security/no-unsafe-query
    .prepare(/* sql */ `
      SELECT
        recordType,
        updateType,
        displayRecordId,
        recordId,
        recordDescription,
        recordUpdate_timeMillis,
        recordUpdate_username,
        recordCreate_timeMillis,
        recordCreate_username
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
    }) as unknown as RecordUpdateLog[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result
}

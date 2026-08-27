import { type DateString, dateStringToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { AuditLogEntry } from '../types/record.types.js'

export type AuditLogMainRecordType =
  | ''
  | 'burialSite'
  | 'burialSiteStatus'
  | 'burialSiteType'
  | 'cemetery'
  | 'committalType'
  | 'contract'
  | 'contractType'
  | 'fee'
  | 'funeralHome'
  | 'intermentContainerType'
  | 'intermentDepth'
  | 'serviceType'
  | 'user'
  | 'workOrder'
  | 'workOrderMilestoneType'
  | 'workOrderType'

export const defaultAuditLogLimit = 50

export default function getAuditLog(
  filters: {
    logDateFrom?: '' | DateString
    logDateTo?: '' | DateString
    mainRecordId?: number | string
    mainRecordType?: AuditLogMainRecordType
    updateUsername?: string
  },
  options?: {
    limit?: number
    offset?: number
  },
  connectedDatabase?: sqlite.Database
): { auditLogEntries: AuditLogEntry[]; count: number } {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const sqlParameters: unknown[] = []
  let sqlWhereClause = ''

  if (filters.logDateFrom !== undefined && filters.logDateFrom !== '') {
    sqlWhereClause += ' and logDate >= ?'
    sqlParameters.push(dateStringToInteger(filters.logDateFrom))
  }

  if (filters.logDateTo !== undefined && filters.logDateTo !== '') {
    sqlWhereClause += ' and logDate <= ?'
    sqlParameters.push(dateStringToInteger(filters.logDateTo))
  }

  if (filters.mainRecordType !== undefined && filters.mainRecordType !== '') {
    sqlWhereClause += ' and mainRecordType = ?'
    sqlParameters.push(filters.mainRecordType)
  }

  if (
    filters.mainRecordId !== undefined &&
    filters.mainRecordId.toString().trim() !== ''
  ) {
    sqlWhereClause += ' and mainRecordId = ?'
    sqlParameters.push(filters.mainRecordId.toString().trim())
  }

  if (
    filters.updateUsername !== undefined &&
    filters.updateUsername.trim() !== ''
  ) {
    sqlWhereClause += ' and updateUsername like ?'
    sqlParameters.push(`%${filters.updateUsername.trim()}%`)
  }

  const count = database
    // eslint-disable-next-line sqlite-security/no-unsafe-query
    .prepare(/* sql */ `
      SELECT
        count(*) AS recordCount
      FROM
        AuditLog
      WHERE
        1 = 1 ${sqlWhereClause}
    `)
    .pluck()
    .get(...sqlParameters) as number

  const limit = options?.limit ?? defaultAuditLogLimit
  const offset = options?.offset ?? 0

  const auditLogEntries = database
    // eslint-disable-next-line sqlite-security/no-unsafe-query
    .prepare(/* sql */ `
      SELECT
        logMillis,
        logDate,
        logTime,
        mainRecordType,
        mainRecordId,
        updateTable,
        recordIndex,
        updateField,
        updateType,
        updateUsername,
        fromValue,
        toValue
      FROM
        AuditLog
      WHERE
        1 = 1 ${sqlWhereClause}
      ORDER BY
        logMillis DESC
      LIMIT
        ?
      OFFSET
        ?
    `)
    .all(...sqlParameters, limit, offset) as AuditLogEntry[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return { auditLogEntries, count }
}

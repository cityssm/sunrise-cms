import { dateToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export type AuditLogMainRecordType =
  | ''
  | 'burialSite'
  | 'cemetery'
  | 'contract'
  | 'user'
  | 'workOrder'

export interface AuditLogEntry {
  logMillis: number
  logDate: number
  logTime: number

  mainRecordType: string
  mainRecordId: number

  updateTable: string
  recordIndex: string | null

  updateField: string
  updateType: string

  updateUserName: string

  fromValue: string | null
  toValue: string | null
}

export default function getAuditLog(
  filters: {
    logDate?: string
    mainRecordType?: AuditLogMainRecordType
  },
  connectedDatabase?: sqlite.Database
): AuditLogEntry[] {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const sqlParameters: unknown[] = []
  let sqlWhereClause = ''

  if (
    filters.logDate !== undefined &&
    filters.logDate !== '' &&
    /^\d{4}-\d{2}-\d{2}$/.test(filters.logDate)
  ) {
    sqlWhereClause += ' and logDate = ?'
    sqlParameters.push(dateToInteger(new Date(filters.logDate + 'T12:00:00')))
  }

  if (
    filters.mainRecordType !== undefined &&
    filters.mainRecordType !== ''
  ) {
    sqlWhereClause += ' and mainRecordType = ?'
    sqlParameters.push(filters.mainRecordType)
  }

  const auditLogEntries = database
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
        updateUserName,
        fromValue,
        toValue
      FROM
        AuditLog
      WHERE
        1 = 1
        ${sqlWhereClause}
      ORDER BY
        logMillis DESC
      LIMIT
        1000
    `)
    .all(...sqlParameters) as AuditLogEntry[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return auditLogEntries
}

import type { DatabaseSync, SQLInputValue } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { BurialSiteType } from '../types/record.types.js'

interface BurialSiteTypeSummary extends BurialSiteType {
  burialSiteCount: number
}

interface GetFilters {
  cemeteryId?: number | string
}

export default function getBurialSiteTypeSummary(
  filters: GetFilters,
  connectedDatabase?: DatabaseSync
): BurialSiteTypeSummary[] {
  const database = connectedDatabase ?? getDatabaseConnection()

  let sqlWhereClause = ' WHERE l.recordDelete_timeMillis IS NULL'
  const sqlParameters: SQLInputValue[] = []

  if (filters.cemeteryId !== undefined && (filters.cemeteryId ?? '') !== '') {
    sqlWhereClause += ' and l.cemeteryId = ?'
    sqlParameters.push(filters.cemeteryId)
  }

  const burialSiteTypes = database
    .prepare(/* sql */ `
      SELECT
        t.burialSiteTypeId,
        t.burialSiteType,
        COUNT(l.burialSiteId) AS burialSiteCount
      FROM
        BurialSites l
        LEFT JOIN BurialSiteTypes t ON l.burialSiteTypeId = t.burialSiteTypeId ${sqlWhereClause}
      GROUP BY
        t.burialSiteTypeId,
        t.burialSiteType,
        t.orderNumber
      ORDER BY
        t.orderNumber
    `)
    .all(...sqlParameters) as unknown as BurialSiteTypeSummary[]

  if (connectedDatabase === undefined) {
    database.close()
  }
  return burialSiteTypes
}

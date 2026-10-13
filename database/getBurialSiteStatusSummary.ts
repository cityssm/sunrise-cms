import type { DatabaseSync, SQLInputValue } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'
import type { BurialSiteStatus } from '../types/record.types.js'

interface BurialSiteStatusSummary extends BurialSiteStatus {
  burialSiteCount: number
}

interface GetFilters {
  cemeteryId?: number | string
}

export default function getBurialSiteStatusSummary(
  filters: GetFilters,
  connectedDatabase?: DatabaseSync
): BurialSiteStatusSummary[] {
  const database = connectedDatabase ?? getDatabaseConnection(true)

  let sqlWhereClause = ' where l.recordDelete_timeMillis IS NULL'
  const sqlParameters: SQLInputValue[] = []

  if (filters.cemeteryId !== undefined && (filters.cemeteryId ?? '') !== '') {
    sqlWhereClause += ' and l.cemeteryId = ?'
    sqlParameters.push(filters.cemeteryId)
  }

  const statuses = database
    .prepare(/* sql */ `
      SELECT
        s.burialSiteStatusId,
        s.burialSiteStatus,
        COUNT(l.burialSiteId) AS burialSiteCount
      FROM
        BurialSites l
        LEFT JOIN BurialSiteStatuses s ON l.burialSiteStatusId = s.burialSiteStatusId ${sqlWhereClause}
      GROUP BY
        s.burialSiteStatusId,
        s.burialSiteStatus,
        s.orderNumber
      ORDER BY
        s.orderNumber
    `)
    .all(...sqlParameters) as unknown as BurialSiteStatusSummary[]

  if (connectedDatabase === undefined) {
    database.close()
  }
  return statuses
}

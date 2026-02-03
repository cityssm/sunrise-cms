import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { BurialSiteStatus } from '../types/record.types.js'

interface BurialSiteStatusSummary extends BurialSiteStatus {
  burialSiteCount: number
}

interface GetFilters {
  cemeteryId?: number | string
}

export default function getBurialSiteStatusSummary(
  filters: GetFilters,
  connectedDatabase?: sqlite.Database
): BurialSiteStatusSummary[] {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  let sqlWhereClause = ' where l.recordDelete_timeMillis is null'
  const sqlParameters: unknown[] = []

  if ((filters.cemeteryId ?? '') !== '') {
    sqlWhereClause += ' and l.cemeteryId = ?'
    sqlParameters.push(filters.cemeteryId)
  }

  const statuses = database
    .prepare(/* sql */ `
      SELECT
        s.burialSiteStatusId,
        s.burialSiteStatus,
        count(l.burialSiteId) AS burialSiteCount
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
    .all(sqlParameters) as BurialSiteStatusSummary[]

  if (connectedDatabase === undefined) {
    database.close()
  }
  return statuses
}

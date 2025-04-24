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
  filters: GetFilters
): BurialSiteStatusSummary[] {
  const database = sqlite(sunriseDB)

  let sqlWhereClause = ' where l.recordDelete_timeMillis is null'
  const sqlParameters: unknown[] = []

  if ((filters.cemeteryId ?? '') !== '') {
    sqlWhereClause += ' and l.cemeteryId = ?'
    sqlParameters.push(filters.cemeteryId)
  }

  const statuses = database
    .prepare(
      `select s.burialSiteStatusId, s.burialSiteStatus,
        count(l.burialSiteId) as burialSiteCount
        from BurialSites l
        left join BurialSiteStatuses s on l.burialSiteStatusId = s.burialSiteStatusId
        ${sqlWhereClause}
        group by s.burialSiteStatusId, s.burialSiteStatus, s.orderNumber
        order by s.orderNumber`
    )
    .all(sqlParameters) as BurialSiteStatusSummary[]

  database.close()

  return statuses
}

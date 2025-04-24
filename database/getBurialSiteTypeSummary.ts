import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { BurialSiteType } from '../types/record.types.js'

interface BurialSiteTypeSummary extends BurialSiteType {
  lotCount: number
}

interface GetFilters {
  cemeteryId?: number | string
}

export default function getBurialSiteTypeSummary(
  filters: GetFilters
): BurialSiteTypeSummary[] {
  const database = sqlite(sunriseDB, { readonly: true })

  let sqlWhereClause = ' where l.recordDelete_timeMillis is null'
  const sqlParameters: unknown[] = []

  if ((filters.cemeteryId ?? '') !== '') {
    sqlWhereClause += ' and l.cemeteryId = ?'
    sqlParameters.push(filters.cemeteryId)
  }

  const burialSiteTypes = database
    .prepare(
      `select t.burialSiteTypeId, t.burialSiteType,
        count(l.burialSiteId) as burialSiteCount
        from BurialSites l
        left join BurialSiteTypes t on l.burialSiteTypeId = t.burialSiteTypeId
        ${sqlWhereClause}
        group by t.burialSiteTypeId, t.burialSiteType, t.orderNumber
        order by t.orderNumber`
    )
    .all(sqlParameters) as BurialSiteTypeSummary[]

  database.close()

  return burialSiteTypes
}

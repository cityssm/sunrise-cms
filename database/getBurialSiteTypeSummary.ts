import type { BurialSiteType } from '../types/record.types.js'

import { acquireConnection } from './pool.js'

interface BurialSiteTypeSummary extends BurialSiteType {
  lotCount: number
}

interface GetFilters {
  cemeteryId?: number | string
}

export default async function getBurialSiteTypeSummary(
  filters: GetFilters
): Promise<BurialSiteTypeSummary[]> {
  const database = await acquireConnection()

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

  database.release()

  return burialSiteTypes
}

import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { Cemetery } from '../types/record.types.js'

export default function getCemeteries(
  filters?: {
    parentCemeteryId?: number | string
  },
  connectedDatabase?: sqlite.Database
): Cemetery[] {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const sqlParameters: Array<number | string> = []

  if (filters?.parentCemeteryId !== undefined) {
    sqlParameters.push(filters.parentCemeteryId)
  }

  const cemeteries = database
    .prepare(
      `select cem.cemeteryId, cem.cemeteryName, cem.cemeteryKey, cem.cemeteryDescription,
          cem.cemeteryLatitude, cem.cemeteryLongitude, cem.cemeterySvg,
          cem.cemeteryAddress1, cem.cemeteryAddress2,
          cem.cemeteryCity, cem.cemeteryProvince, cem.cemeteryPostalCode,
          cem.cemeteryPhoneNumber,
          p.cemeteryId as parentCemeteryId, p.cemeteryName as parentCemeteryName,
          count(b.burialSiteId) as burialSiteCount

        from Cemeteries cem
        left join Cemeteries p on cem.parentCemeteryId = p.cemeteryId and p.recordDelete_timeMillis is null
        left join BurialSites b on cem.cemeteryId = b.cemeteryId and b.recordDelete_timeMillis is null
        
        where cem.recordDelete_timeMillis is null
        ${filters?.parentCemeteryId === undefined ? '' : 'and cem.parentCemeteryId = ?'}

        group by cem.cemeteryId, cem.cemeteryName, cem.cemeteryDescription,
          cem.cemeteryLatitude, cem.cemeteryLongitude, cem.cemeterySvg,
          cem.cemeteryAddress1, cem.cemeteryAddress2, cem.cemeteryCity, cem.cemeteryProvince, cem.cemeteryPostalCode,
          cem.cemeteryPhoneNumber,
          p.cemeteryId, p.cemeteryName

        order by cem.cemeteryName, cem.cemeteryId`
    )
    .all(sqlParameters) as Cemetery[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return cemeteries
}

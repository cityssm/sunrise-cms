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
      `select c.cemeteryId, c.cemeteryName, c.cemeteryKey, c.cemeteryDescription,
          c.cemeteryLatitude, c.cemeteryLongitude, c.cemeterySvg,
          c.cemeteryAddress1, c.cemeteryAddress2,
          c.cemeteryCity, c.cemeteryProvince, c.cemeteryPostalCode,
          c.cemeteryPhoneNumber,
          p.cemeteryId as parentCemeteryId, p.cemeteryName as parentCemeteryName,
          count(b.burialSiteId) as burialSiteCount

        from Cemeteries c
        left join Cemeteries p on c.parentCemeteryId = p.cemeteryId and p.recordDelete_timeMillis is null
        left join BurialSites b on c.cemeteryId = b.cemeteryId and b.recordDelete_timeMillis is null
        
        where c.recordDelete_timeMillis is null
        ${filters?.parentCemeteryId === undefined ? '' : 'and c.parentCemeteryId = ?'}

        group by c.cemeteryId, c.cemeteryName, c.cemeteryDescription,
          c.cemeteryLatitude, c.cemeteryLongitude, c.cemeterySvg,
          c.cemeteryAddress1, c.cemeteryAddress2, c.cemeteryCity, c.cemeteryProvince, c.cemeteryPostalCode,
          c.cemeteryPhoneNumber,
          p.cemeteryId, p.cemeteryName

        order by c.cemeteryName, c.cemeteryId`
    )
    .all(sqlParameters) as Cemetery[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return cemeteries
}

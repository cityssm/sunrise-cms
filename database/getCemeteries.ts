import type { Cemetery } from '../types/recordTypes.js'

import { acquireConnection } from './pool.js'

export default async function getCemeteries(filters?: {
  parentCemeteryId?: number | string
}
): Promise<Cemetery[]> {
  const database = await acquireConnection()

  const sqlParameters: Array<number | string> = []

  if (filters?.parentCemeteryId !== undefined) {
    sqlParameters.push(filters.parentCemeteryId)
  }

  const cemeteries = database
    .prepare(
      `select m.cemeteryId, m.cemeteryName, m.cemeteryKey, m.cemeteryDescription,
        m.cemeteryLatitude, m.cemeteryLongitude, m.cemeterySvg,
        m.cemeteryAddress1, m.cemeteryAddress2, m.cemeteryCity, m.cemeteryProvince, m.cemeteryPostalCode,
        m.cemeteryPhoneNumber,
        p.cemeteryId as parentCemeteryId, p.cemeteryName as parentCemeteryName,
        count(b.burialSiteId) as burialSiteCount
        from Cemeteries m
        left join Cemeteries p on m.parentCemeteryId = p.cemeteryId and p.recordDelete_timeMillis is null
        left join BurialSites b on m.cemeteryId = b.cemeteryId and b.recordDelete_timeMillis is null
        where m.recordDelete_timeMillis is null
        ${filters?.parentCemeteryId === undefined ? '' : 'and m.parentCemeteryId = ?'}
        group by m.cemeteryId, m.cemeteryName, m.cemeteryDescription,
          m.cemeteryLatitude, m.cemeteryLongitude, m.cemeterySvg,
          m.cemeteryAddress1, m.cemeteryAddress2, m.cemeteryCity, m.cemeteryProvince, m.cemeteryPostalCode,
          m.cemeteryPhoneNumber,
          p.cemeteryId, p.cemeteryName
        order by m.cemeteryName, m.cemeteryId`
    )
    .all(sqlParameters) as Cemetery[]

  database.release()

  return cemeteries
}

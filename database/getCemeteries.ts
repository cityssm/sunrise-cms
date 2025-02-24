import type { Cemetery } from '../types/recordTypes.js'

import { acquireConnection } from './pool.js'

export default async function getCemeteries(): Promise<Cemetery[]> {
  const database = await acquireConnection()

  const cemeteries = database
    .prepare(
      `select m.cemeteryId, m.cemeteryName, m.cemeteryDescription,
        m.cemeteryLatitude, m.cemeteryLongitude, m.cemeterySvg,
        m.cemeteryAddress1, m.cemeteryAddress2, m.cemeteryCity, m.cemeteryProvince, m.cemeteryPostalCode,
        m.cemeteryPhoneNumber,
        ifnull(l.burialSiteCount, 0) as burialSiteCount
        from Cemeteries m
        left join (
          select cemeteryId, count(burialSiteId) as burialSiteCount
          from BurialSites
          where recordDelete_timeMillis is null
          group by cemeteryId
        ) l on m.cemeteryId = l.cemeteryId
        where m.recordDelete_timeMillis is null
        order by m.cemeteryName, m.cemeteryId`
    )
    .all() as Cemetery[]

  database.release()

  return cemeteries
}

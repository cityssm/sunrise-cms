import type { PoolConnection } from 'better-sqlite-pool'

import type { Cemetery } from '../types/recordTypes.js'

import { acquireConnection } from './pool.js'

export default async function getCemetery(
  cemeteryId: number | string,
  connectedDatabase?: PoolConnection
): Promise<Cemetery | undefined> {
  const database = connectedDatabase ?? (await acquireConnection())

  const cemetery = database
    .prepare(
      `select m.cemeteryId, m.cemeteryName, m.cemeteryKey, m.cemeteryDescription,
        m.cemeteryLatitude, m.cemeteryLongitude, m.cemeterySvg,
        m.cemeteryAddress1, m.cemeteryAddress2, m.cemeteryCity, m.cemeteryProvince, m.cemeteryPostalCode,
        m.cemeteryPhoneNumber,
        m.recordCreate_userName, m.recordCreate_timeMillis,
        m.recordUpdate_userName, m.recordUpdate_timeMillis,
        m.recordDelete_userName, m.recordDelete_timeMillis,
        count(l.burialSiteId) as burialSiteCount
        from Cemeteries m
        left join BurialSites l on m.cemeteryId = l.cemeteryId and l.recordDelete_timeMillis is null
        where m.cemeteryId = ?
          and m.recordDelete_timeMillis is null
        group by m.cemeteryId, m.cemeteryName, m.cemeteryDescription,
          m.cemeteryLatitude, m.cemeteryLongitude, m.cemeterySvg,
          m.cemeteryAddress1, m.cemeteryAddress2, m.cemeteryCity, m.cemeteryProvince, m.cemeteryPostalCode,
          m.cemeteryPhoneNumber,
          m.recordCreate_userName, m.recordCreate_timeMillis,
          m.recordUpdate_userName, m.recordUpdate_timeMillis,
          m.recordDelete_userName, m.recordDelete_timeMillis`
    )
    .get(cemeteryId) as Cemetery | undefined

  if (connectedDatabase === undefined) {
    database.release()
  }

  return cemetery
}

import type { PoolConnection } from 'better-sqlite-pool'

import type { Cemetery } from '../types/record.types.js'

import getCemeteries from './getCemeteries.js'
import { acquireConnection } from './pool.js'

export default async function getCemetery(
  cemeteryId: number | string,
  connectedDatabase?: PoolConnection
): Promise<Cemetery | undefined> {
  return await _getCemetery('cemeteryId', cemeteryId, connectedDatabase)
}

export async function getCemeteryByKey(
  cemeteryKey: string,
  connectedDatabase?: PoolConnection
): Promise<Cemetery | undefined> {
  return await _getCemetery('cemeteryKey', cemeteryKey, connectedDatabase)
}

async function _getCemetery(
  keyColumn: 'cemeteryId' | 'cemeteryKey',
  cemeteryIdOrKey: number | string,
  connectedDatabase?: PoolConnection
): Promise<Cemetery | undefined> {
  const database = connectedDatabase ?? (await acquireConnection())

  const cemetery = database
    .prepare(
      `select m.cemeteryId, m.cemeteryName, m.cemeteryKey, m.cemeteryDescription,
        m.cemeteryLatitude, m.cemeteryLongitude, m.cemeterySvg,
        m.cemeteryAddress1, m.cemeteryAddress2, m.cemeteryCity, m.cemeteryProvince, m.cemeteryPostalCode,
        m.cemeteryPhoneNumber,

        p.cemeteryId as parentCemeteryId, p.cemeteryName as parentCemeteryName,
        p.cemeteryLatitude as parentCemeteryLatitude, p.cemeteryLongitude as parentCemeteryLongitude,
        p.cemeterySvg as parentCemeterySvg,

        m.recordCreate_userName, m.recordCreate_timeMillis,
        m.recordUpdate_userName, m.recordUpdate_timeMillis,
        m.recordDelete_userName, m.recordDelete_timeMillis,
        count(l.burialSiteId) as burialSiteCount
        from Cemeteries m
        left join Cemeteries p on m.parentCemeteryId = p.cemeteryId and p.recordDelete_timeMillis is null
        left join BurialSites l on m.cemeteryId = l.cemeteryId and l.recordDelete_timeMillis is null
        where m.${keyColumn} = ?
          and m.recordDelete_timeMillis is null
        group by m.cemeteryId, m.cemeteryName, m.cemeteryDescription,
          m.cemeteryLatitude, m.cemeteryLongitude, m.cemeterySvg,
          m.cemeteryAddress1, m.cemeteryAddress2, m.cemeteryCity, m.cemeteryProvince, m.cemeteryPostalCode,
          m.cemeteryPhoneNumber,
          p.cemeteryId, p.cemeteryName,
          m.recordCreate_userName, m.recordCreate_timeMillis,
          m.recordUpdate_userName, m.recordUpdate_timeMillis,
          m.recordDelete_userName, m.recordDelete_timeMillis`
    )
    .get(cemeteryIdOrKey) as Cemetery | undefined

  if (cemetery !== undefined) {
    cemetery.childCemeteries =
      cemetery.parentCemeteryId === null
        ? await getCemeteries({ parentCemeteryId: cemetery.cemeteryId })
        : []
  }

  if (connectedDatabase === undefined) {
    database.release()
  }

  return cemetery
}

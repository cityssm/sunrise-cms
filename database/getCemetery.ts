import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'
import type { Cemetery } from '../types/record.types.js'

import getCemeteries from './getCemeteries.js'
import getCemeteryDirectionsOfArrival from './getCemeteryDirectionsOfArrival.js'

export default function getCemetery(
  cemeteryId: number | string,
  connectedDatabase?: sqlite.Database
): Cemetery | undefined {
  return _getCemetery('cemeteryId', cemeteryId, connectedDatabase)
}

export function getCemeteryByKey(
  cemeteryKey: string,
  connectedDatabase?: sqlite.Database
): Cemetery | undefined {
  return _getCemetery('cemeteryKey', cemeteryKey, connectedDatabase)
}

function _getCemetery(
  keyColumn: 'cemeteryId' | 'cemeteryKey',
  cemeteryIdOrKey: number | string,
  connectedDatabase?: sqlite.Database
): Cemetery | undefined {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const cemetery = database
    .prepare(/* sql */ `select cem.cemeteryId, cem.cemeteryName, cem.cemeteryKey, cem.cemeteryDescription,
        cem.cemeteryLatitude, cem.cemeteryLongitude, cem.cemeterySvg,
        cem.cemeteryAddress1, cem.cemeteryAddress2, cem.cemeteryCity, cem.cemeteryProvince, cem.cemeteryPostalCode,
        cem.cemeteryPhoneNumber,

        p.cemeteryId as parentCemeteryId, p.cemeteryName as parentCemeteryName,
        p.cemeteryLatitude as parentCemeteryLatitude, p.cemeteryLongitude as parentCemeteryLongitude,
        p.cemeterySvg as parentCemeterySvg,

        cem.recordCreate_userName, cem.recordCreate_timeMillis,
        cem.recordUpdate_userName, cem.recordUpdate_timeMillis,
        cem.recordDelete_userName, cem.recordDelete_timeMillis,
        count(b.burialSiteId) as burialSiteCount
        from Cemeteries cem
        left join Cemeteries p on cem.parentCemeteryId = p.cemeteryId and p.recordDelete_timeMillis is null
        left join BurialSites b on cem.cemeteryId = b.cemeteryId and b.recordDelete_timeMillis is null
        where cem.${keyColumn} = ?
          and cem.recordDelete_timeMillis is null
        group by cem.cemeteryId, cem.cemeteryName, cem.cemeteryDescription,
          cem.cemeteryLatitude, cem.cemeteryLongitude, cem.cemeterySvg,
          cem.cemeteryAddress1, cem.cemeteryAddress2, cem.cemeteryCity, cem.cemeteryProvince, cem.cemeteryPostalCode,
          cem.cemeteryPhoneNumber,
          p.cemeteryId, p.cemeteryName,
          cem.recordCreate_userName, cem.recordCreate_timeMillis,
          cem.recordUpdate_userName, cem.recordUpdate_timeMillis,
          cem.recordDelete_userName, cem.recordDelete_timeMillis`
    )
    .get(cemeteryIdOrKey) as Cemetery | undefined

  if (cemetery !== undefined) {
    cemetery.childCemeteries =
      cemetery.parentCemeteryId === null
        ? getCemeteries(
            { parentCemeteryId: cemetery.cemeteryId },
            connectedDatabase
          )
        : []

    cemetery.directionsOfArrival = getCemeteryDirectionsOfArrival(
      cemetery.cemeteryId as number,
      connectedDatabase
    )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return cemetery
}

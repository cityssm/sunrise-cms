import sqlite from 'better-sqlite3'

import { buildBurialSiteName } from '../helpers/burialSites.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import getCemetery from './getCemetery.js'

export default function rebuildBurialSiteNames(
  cemeteryId: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): number {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  /*
   * Get the cemetery key
   */

  const cemetery = getCemetery(cemeteryId, database)

  if (cemetery === undefined) {
    if (connectedDatabase === undefined) {
      database.close()
    }

    return 0
  }

  const result = database
    .function('buildBurialSiteName', buildBurialSiteNameUserFunction)
    .prepare(
      `update BurialSites
        set burialSiteName = buildBurialSiteName(?, burialSiteNameSegment1, burialSiteNameSegment2, burialSiteNameSegment3, burialSiteNameSegment4, burialSiteNameSegment5),
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where cemeteryId = ?
        and recordDelete_timeMillis is null`
    )
    .run(cemetery.cemeteryKey, user.userName, Date.now(), cemeteryId)

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes
}

// eslint-disable-next-line @typescript-eslint/max-params
function buildBurialSiteNameUserFunction(
  cemeteryKey: string,
  burialSiteNameSegment1: string,
  burialSiteNameSegment2: string,
  burialSiteNameSegment3: string,
  burialSiteNameSegment4: string,
  burialSiteNameSegment5: string
): string {
  return buildBurialSiteName(cemeteryKey, {
    burialSiteNameSegment1,
    burialSiteNameSegment2,
    burialSiteNameSegment3,
    burialSiteNameSegment4,
    burialSiteNameSegment5
  })
}

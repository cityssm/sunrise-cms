import type { PoolConnection } from 'better-sqlite-pool'

import { buildBurialSiteName } from '../helpers/burialSites.helpers.js'

import getBurialSites from './getBurialSites.js'
import getCemetery from './getCemetery.js'
import { acquireConnection } from './pool.js'

export default async function rebuildBurialSiteNames(
  cemeteryId: number | string,
  user: User,
  connectedDatabase?: PoolConnection
): Promise<number> {
  const database = connectedDatabase ?? (await acquireConnection())

  /*
   * Get the cemetery key
   */

  const cemetery = await getCemetery(cemeteryId, database)

  if (cemetery === undefined) {
    if (connectedDatabase === undefined) {
      database.release()
    }

    return 0
  }

  /*
   * Get the burial sites
   */

  const burialSites = await getBurialSites(
    {
      cemeteryId
    },
    {
      limit: -1,
      offset: 0
    },
    database
  )

  let updateCount = 0

  for (const burialSite of burialSites.burialSites) {
    const burialSiteName = buildBurialSiteName(cemetery.cemeteryKey, burialSite)

    if (burialSiteName !== burialSite.burialSiteName) {
      const result = database
        .prepare(
          `update BurialSites
            set burialSiteName = ?,
            recordUpdate_userName = ?,
            recordUpdate_timeMillis = ?
            where burialSiteId = ?
            and recordDelete_timeMillis is null`
        )
        .run(burialSiteName, user.userName, Date.now(), burialSite.burialSiteId)

      updateCount += result.changes
    }
  }

  if (connectedDatabase === undefined) {
    database.release()
  }
  return updateCount
}

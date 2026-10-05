import { type SQLOutputValue, DatabaseSync } from 'node:sqlite'

import { buildBurialSiteName } from '../helpers/burialSites.helpers.js'
import { sunriseDB } from '../helpers/database.helpers.js'

import getCemetery from './getCemetery.js'

export default function rebuildBurialSiteNames(
  cemeteryId: number | string,
  user: User,
  connectedDatabase?: DatabaseSync
): number {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

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

  database.function(
    'buildBurialSiteName',
    {
      deterministic: true
    },
    buildBurialSiteNameUserFunction
  )

  const result = database
    .prepare(/* sql */ `
      UPDATE BurialSites
      SET
        burialSiteName = buildBurialSiteName (
          ?,
          burialSiteNameSegment1,
          burialSiteNameSegment2,
          burialSiteNameSegment3,
          burialSiteNameSegment4,
          burialSiteNameSegment5
        ),
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        cemeteryId = ?
        AND recordDelete_timeMillis IS NULL
    `)
    .run(cemetery.cemeteryKey, user.username, Date.now(), cemeteryId)

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes as number
}

// eslint-disable-next-line @typescript-eslint/max-params
function buildBurialSiteNameUserFunction(
  cemeteryKey: SQLOutputValue,
  burialSiteNameSegment1: SQLOutputValue,
  burialSiteNameSegment2: SQLOutputValue,
  burialSiteNameSegment3: SQLOutputValue,
  burialSiteNameSegment4: SQLOutputValue,
  burialSiteNameSegment5: SQLOutputValue
): string {
  return buildBurialSiteName(cemeteryKey as string, {
    burialSiteNameSegment1: burialSiteNameSegment1 as string,
    burialSiteNameSegment2: burialSiteNameSegment2 as string,
    burialSiteNameSegment3: burialSiteNameSegment3 as string,
    burialSiteNameSegment4: burialSiteNameSegment4 as string,
    burialSiteNameSegment5: burialSiteNameSegment5 as string
  })
}

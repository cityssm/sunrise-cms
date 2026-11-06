import type { DatabaseSync, SQLOutputValue } from 'node:sqlite'

import { buildBurialSiteName } from '../helpers/burialSites.helpers.js'
import { getDatabaseConnection } from '../helpers/database.helpers.js'

import getCemetery from './getCemetery.js'

export default function rebuildBurialSiteNames(
  cemeteryId: number | string,
  user: User,
  connectedDatabase?: DatabaseSync
): number {
  const database = connectedDatabase ?? getDatabaseConnection()

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

  database.exec('pragma optimize')

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes as number
}

// eslint-disable-next-line @typescript-eslint/max-params
function buildBurialSiteNameUserFunction(
  cemeteryKey: SQLOutputValue,
  burialSiteNameSegment1DatabaseValue: SQLOutputValue,
  burialSiteNameSegment2DatabaseValue: SQLOutputValue,
  burialSiteNameSegment3DatabaseValue: SQLOutputValue,
  burialSiteNameSegment4DatabaseValue: SQLOutputValue,
  burialSiteNameSegment5DatabaseValue: SQLOutputValue
): string {
  return buildBurialSiteName(cemeteryKey as string, {
    burialSiteNameSegment1: burialSiteNameSegment1DatabaseValue as string,
    burialSiteNameSegment2: burialSiteNameSegment2DatabaseValue as string,
    burialSiteNameSegment3: burialSiteNameSegment3DatabaseValue as string,
    burialSiteNameSegment4: burialSiteNameSegment4DatabaseValue as string,
    burialSiteNameSegment5: burialSiteNameSegment5DatabaseValue as string
  })
}

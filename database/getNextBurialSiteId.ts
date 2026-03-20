import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function getNextBurialSiteId(
  burialSiteId: number | string,
  connectedDatabase?: sqlite.Database
): number | undefined {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const result = database
    .prepare(/* sql */ `
      SELECT
        burialSiteId
      FROM
        BurialSites
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteName > (
          SELECT
            burialSiteName
          FROM
            BurialSites
          WHERE
            burialSiteId = ?
        )
      ORDER BY
        burialSiteName
      LIMIT
        1
    `)
    .pluck()
    .get(burialSiteId) as number | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result
}

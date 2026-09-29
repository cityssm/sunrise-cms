import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function getPreviousBurialSiteId(
  burialSiteId: number | string,
  connectedDatabase?: DatabaseSync
): number | undefined {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const result = database
    .prepare(/* sql */ `
      SELECT
        burialSiteId
      FROM
        BurialSites
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteName < (
          SELECT
            burialSiteName
          FROM
            BurialSites
          WHERE
            burialSiteId = ?
        )
      ORDER BY
        burialSiteName DESC
      LIMIT
        1
    `)
    .get(burialSiteId) as unknown as { burialSiteId: number } | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result?.burialSiteId
}

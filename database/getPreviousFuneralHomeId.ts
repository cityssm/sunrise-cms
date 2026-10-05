import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function getPreviousFuneralHomeId(
  funeralHomeId: number | string,
  connectedDatabase?: DatabaseSync
): number | undefined {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB, { readOnly: true })

  const result = database
    .prepare(/* sql */ `
      SELECT
        funeralHomeId
      FROM
        FuneralHomes
      WHERE
        recordDelete_timeMillis IS NULL
        AND funeralHomeName < (
          SELECT
            funeralHomeName
          FROM
            FuneralHomes
          WHERE
            funeralHomeId = ?
        )
      ORDER BY
        funeralHomeName DESC
      LIMIT
        1
    `)
    .get(funeralHomeId) as unknown as { funeralHomeId: number } | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result?.funeralHomeId
}

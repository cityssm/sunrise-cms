import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

const limit = 20

export default function getFuneralDirectorNamesByFuneralHomeId(
  funeralHomeId: number | string,
  connectedDatabase?: sqlite.Database
): string[] {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })

  const funeralDirectors = database
    .prepare(/* sql */ `
      SELECT
        funeralDirectorName
      FROM
        Contracts
      WHERE
        recordDelete_timeMillis IS NULL
        AND funeralHomeId = ?
        AND funeralDirectorName IS NOT NULL
        AND trim(funeralDirectorName) != ''
      GROUP BY
        funeralDirectorName
      ORDER BY
        count(*) DESC,
        funeralDirectorName
      LIMIT
        ${limit}
    `)
    .pluck()
    .all(funeralHomeId) as string[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return funeralDirectors
}

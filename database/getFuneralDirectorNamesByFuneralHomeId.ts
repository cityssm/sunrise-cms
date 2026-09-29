import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'

const limit = 20

export default function getFuneralDirectorNamesByFuneralHomeId(
  funeralHomeId: number | string,
  connectedDatabase?: DatabaseSync
): string[] {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const funeralDirectors = database
    // eslint-disable-next-line sqlite-security/no-unsafe-query
    .prepare(/* sql */ `
      SELECT
        funeralDirectorName
      FROM
        Contracts
      WHERE
        recordDelete_timeMillis IS NULL
        AND funeralHomeId = ?
        AND funeralDirectorName IS NOT NULL
        AND TRIM(funeralDirectorName) != ''
      GROUP BY
        funeralDirectorName
      ORDER BY
        COUNT(*) DESC,
        funeralDirectorName
      LIMIT
        ${limit}
    `)
    .all(funeralHomeId) as unknown as Array<{ funeralDirectorName: string }>

  if (connectedDatabase === undefined) {
    database.close()
  }

  return funeralDirectors.map((fd) => fd.funeralDirectorName)
}

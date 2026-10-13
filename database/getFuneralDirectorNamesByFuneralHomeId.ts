import type { DatabaseSync } from 'node:sqlite'

import { getDatabaseConnection } from '../helpers/database.helpers.js'

const limit = 20

export default function getFuneralDirectorNamesByFuneralHomeId(
  funeralHomeId: number | string,
  connectedDatabase?: DatabaseSync
): string[] {
  const database =
    connectedDatabase ?? getDatabaseConnection(true)

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

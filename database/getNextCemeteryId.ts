import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function getNextCemeteryId(
  cemeteryId: number | string,
  connectedDatabase?: DatabaseSync
): number | undefined {
  const database =
    connectedDatabase ?? new DatabaseSync(sunriseDB, { readOnly: true })

  const result = database
    .prepare(/* sql */ `
      SELECT
        cemeteryId
      FROM
        Cemeteries
      WHERE
        recordDelete_timeMillis IS NULL
        AND cemeteryName > (
          SELECT
            cemeteryName
          FROM
            Cemeteries
          WHERE
            cemeteryId = ?
        )
      ORDER BY
        cemeteryName
      LIMIT
        1
    `)
    .get(cemeteryId) as unknown as { cemeteryId: number } | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result?.cemeteryId
}

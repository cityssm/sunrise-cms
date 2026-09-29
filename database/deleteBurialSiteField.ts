import { DatabaseSync } from 'node:sqlite'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function deleteBurialSiteField(
  burialSiteId: number | string,
  burialSiteTypeFieldId: number | string,
  user: User,
  connectedDatabase?: DatabaseSync
): boolean {
  const database = connectedDatabase ?? new DatabaseSync(sunriseDB)

  const result = database
    .prepare(/* sql */ `
      UPDATE BurialSiteFields
      SET
        recordDelete_username = ?,
        recordDelete_timeMillis = ?
      WHERE
        burialSiteId = ?
        AND burialSiteTypeFieldId = ?
    `)
    .run(user.username, Date.now(), burialSiteId, burialSiteTypeFieldId)

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

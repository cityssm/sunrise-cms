import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function deleteWorkOrderBurialSite(
  workOrderId: number | string,
  burialSiteId: number | string,
  user: User
): boolean {
  const database = sqlite(sunriseDB)

  const result = database
    .prepare(
      `update WorkOrderBurialSites
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where workOrderId = ?
        and burialSiteId = ?`
    )
    .run(user.userName, Date.now(), workOrderId, burialSiteId)

  database.close()

  return result.changes > 0
}

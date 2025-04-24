import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function reopenWorkOrder(
  workOrderId: number | string,
  user: User
): boolean {
  const database = sqlite(sunriseDB)

  const result = database
    .prepare(
      `update WorkOrders
        set workOrderCloseDate = null,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where workOrderId = ?
        and workOrderCloseDate is not null`
    )
    .run(user.userName, Date.now(), workOrderId)

  database.close()

  return result.changes > 0
}

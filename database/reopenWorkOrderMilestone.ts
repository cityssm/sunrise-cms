import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export default function reopenWorkOrderMilestone(
  workOrderMilestoneId: number | string,
  user: User,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(sunriseDB)

  const result = database
    .prepare(/* sql */ `
      UPDATE WorkOrderMilestones
      SET
        workOrderMilestoneCompletionDate = NULL,
        workOrderMilestoneCompletionTime = NULL,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        workOrderMilestoneId = ?
        AND workOrderMilestoneCompletionDate IS NOT NULL
    `)
    .run(user.userName, Date.now(), workOrderMilestoneId)

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}

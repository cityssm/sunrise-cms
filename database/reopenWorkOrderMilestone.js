import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function reopenWorkOrderMilestone(workOrderMilestoneId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const result = database
        .prepare(`update WorkOrderMilestones
        set workOrderMilestoneCompletionDate = null,
          workOrderMilestoneCompletionTime = null,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where workOrderMilestoneId = ?
          and workOrderMilestoneCompletionDate is not null`)
        .run(user.userName, Date.now(), workOrderMilestoneId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}

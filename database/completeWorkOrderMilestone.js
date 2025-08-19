import { dateStringToInteger, dateToInteger, dateToTimeInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function completeWorkOrderMilestone(milestoneForm, user, connectedDatabase) {
    const rightNow = new Date();
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const completionDate = (milestoneForm.workOrderMilestoneCompletionDateString ?? '') === ''
        ? dateToInteger(rightNow)
        : dateStringToInteger(milestoneForm.workOrderMilestoneCompletionDateString);
    const completionTime = (milestoneForm.workOrderMilestoneCompletionTimeString ?? '') === ''
        ? dateToTimeInteger(rightNow)
        : timeStringToInteger(milestoneForm.workOrderMilestoneCompletionTimeString);
    const result = database
        .prepare(`update WorkOrderMilestones
        set workOrderMilestoneCompletionDate = ?,
        workOrderMilestoneCompletionTime = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where workOrderMilestoneId = ?`)
        .run(completionDate, completionTime, user.userName, rightNow.getTime(), milestoneForm.workOrderMilestoneId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}

import { dateStringToInteger, dateToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export function updateWorkOrderMilestoneTime(milestoneForm, user) {
    const database = sqlite(sunriseDB);
    const result = database
        .prepare(`update WorkOrderMilestones
        set workOrderMilestoneDate = ?,
          workOrderMilestoneTime = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where workOrderMilestoneId = ?`)
        .run(milestoneForm.workOrderMilestoneDateString === ''
        ? dateToInteger(new Date())
        : dateStringToInteger(milestoneForm.workOrderMilestoneDateString), (milestoneForm.workOrderMilestoneTimeString ?? '') === ''
        ? undefined
        : timeStringToInteger(milestoneForm.workOrderMilestoneTimeString), user.userName, Date.now(), milestoneForm.workOrderMilestoneId);
    database.close();
    return result.changes > 0;
}

import { dateStringToInteger, dateToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addWorkOrderMilestone(milestoneForm, user, connectedDatabase) {
    const rightNowMillis = Date.now();
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const result = database
        .prepare(`insert into WorkOrderMilestones (
        workOrderId, workOrderMilestoneTypeId,
        workOrderMilestoneDate, workOrderMilestoneTime,
        workOrderMilestoneDescription,
        workOrderMilestoneCompletionDate, workOrderMilestoneCompletionTime,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(milestoneForm.workOrderId, milestoneForm.workOrderMilestoneTypeId === ''
        ? undefined
        : milestoneForm.workOrderMilestoneTypeId, milestoneForm.workOrderMilestoneDateString === ''
        ? dateToInteger(new Date())
        : dateStringToInteger(milestoneForm.workOrderMilestoneDateString), (milestoneForm.workOrderMilestoneTimeString ?? '') === ''
        ? undefined
        : timeStringToInteger(milestoneForm.workOrderMilestoneTimeString), milestoneForm.workOrderMilestoneDescription, (milestoneForm.workOrderMilestoneCompletionDateString ?? '') === ''
        ? undefined
        : dateStringToInteger(milestoneForm.workOrderMilestoneCompletionDateString), (milestoneForm.workOrderMilestoneCompletionTimeString ?? '') === ''
        ? undefined
        : timeStringToInteger(milestoneForm.workOrderMilestoneCompletionTimeString), user.userName, rightNowMillis, user.userName, rightNowMillis);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.lastInsertRowid;
}

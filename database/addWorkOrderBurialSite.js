import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addWorkOrderBurialSite(workOrderBurialSiteForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const recordDeleteTimeMillis = database
        .prepare(`select recordDelete_timeMillis
        from WorkOrderBurialSites
        where workOrderId = ?
        and burialSiteId = ?`)
        .pluck()
        .get(workOrderBurialSiteForm.workOrderId, workOrderBurialSiteForm.burialSiteId);
    if (recordDeleteTimeMillis === undefined) {
        database
            .prepare(`insert into WorkOrderBurialSites (
          workOrderId, burialSiteId,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?)`)
            .run(workOrderBurialSiteForm.workOrderId, workOrderBurialSiteForm.burialSiteId, user.userName, rightNowMillis, user.userName, rightNowMillis);
    }
    else if (recordDeleteTimeMillis !== null) {
        database
            .prepare(`update WorkOrderBurialSites
          set recordCreate_userName = ?,
            recordCreate_timeMillis = ?,
            recordUpdate_userName = ?,
            recordUpdate_timeMillis = ?,
            recordDelete_userName = null,
            recordDelete_timeMillis = null
          where workOrderId = ?
            and burialSiteId = ?`)
            .run(user.userName, rightNowMillis, user.userName, rightNowMillis, workOrderBurialSiteForm.workOrderId, workOrderBurialSiteForm.burialSiteId);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return true;
}

import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default function getBurialSiteStatuses() {
    const database = sqlite(sunriseDB);
    const statuses = database
        .prepare(`select burialSiteStatusId, burialSiteStatus, orderNumber
        from BurialSiteStatuses
        where recordDelete_timeMillis is null
        order by orderNumber, burialSiteStatus`)
        .all();
    let expectedOrderNumber = 0;
    for (const status of statuses) {
        if (status.orderNumber !== expectedOrderNumber) {
            updateRecordOrderNumber('BurialSiteStatuses', status.burialSiteStatusId, expectedOrderNumber, database);
            status.orderNumber = expectedOrderNumber;
        }
        expectedOrderNumber += 1;
    }
    database.close();
    return statuses;
}

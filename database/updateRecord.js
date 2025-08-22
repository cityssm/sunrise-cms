import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
const recordNameIdColumns = new Map([
    ['BurialSiteStatuses', ['burialSiteStatus', 'burialSiteStatusId']],
    ['CommittalTypes', ['committalType', 'committalTypeId']],
    [
        'WorkOrderMilestoneTypes',
        ['workOrderMilestoneType', 'workOrderMilestoneTypeId']
    ],
    ['WorkOrderTypes', ['workOrderType', 'workOrderTypeId']]
]);
export function updateRecord(recordTable, recordId, recordName, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const columnNames = recordNameIdColumns.get(recordTable);
    if (columnNames === undefined) {
        throw new Error(`Invalid record table: ${recordTable}`);
    }
    const result = database
        .prepare(`update ${recordTable}
        set ${columnNames[0]} = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and ${columnNames[1]} = ?`)
        .run(recordName, user.userName, Date.now(), recordId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName(recordTable);
    return result.changes > 0;
}

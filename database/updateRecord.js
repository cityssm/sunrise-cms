import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { clearCacheByTableName } from '../helpers/functions.cache.js';
const recordNameIdColumns = new Map([
    ['BurialSiteStatuses', ['burialSiteStatus', 'burialSiteStatusId']],
    ['BurialSiteTypes', ['burialSiteType', 'burialSiteTypeId']],
    ['CommittalTypes', ['committalType', 'committalTypeId']],
    [
        'WorkOrderMilestoneTypes',
        ['workOrderMilestoneType', 'workOrderMilestoneTypeId']
    ],
    ['WorkOrderTypes', ['workOrderType', 'workOrderTypeId']]
]);
export function updateRecord(recordTable, recordId, recordName, user) {
    const database = sqlite(sunriseDB);
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
    database.close();
    clearCacheByTableName(recordTable);
    return result.changes > 0;
}

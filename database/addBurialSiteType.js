import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addBurialSiteType(addForm, user) {
    const database = sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`insert into BurialSiteTypes (
        burialSiteType, bodyCapacityMax, crematedCapacityMax,
        orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(addForm.burialSiteType, addForm.bodyCapacityMax === '' ? undefined : addForm.bodyCapacityMax, addForm.crematedCapacityMax === ''
        ? undefined
        : addForm.crematedCapacityMax, addForm.orderNumber ?? -1, user.userName, rightNowMillis, user.userName, rightNowMillis);
    database.close();
    clearCacheByTableName('BurialSiteTypes');
    return result.lastInsertRowid;
}

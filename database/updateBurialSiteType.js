import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function updateBurialSiteType(updateForm, user) {
    const database = sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`update BurialSiteTypes
        set burialSiteType = ?,
          bodyCapacityMax = ?,
          crematedCapacityMax = ?,
          recordUpdate_userName = ?, recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
          and burialSiteTypeId = ?`)
        .run(updateForm.burialSiteType, updateForm.bodyCapacityMax === ''
        ? undefined
        : updateForm.bodyCapacityMax, updateForm.crematedCapacityMax === ''
        ? undefined
        : updateForm.crematedCapacityMax, user.userName, rightNowMillis, updateForm.burialSiteTypeId);
    database.close();
    clearCacheByTableName('BurialSiteTypes');
    return result.changes > 0;
}

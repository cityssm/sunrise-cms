import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function updateBurialSiteTypeField(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const result = database
        .prepare(`update BurialSiteTypeFields
        set burialSiteTypeField = ?,
          isRequired = ?,
          fieldType = ?,
          minLength = ?,
          maxLength = ?,
          pattern = ?,
          fieldValues = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where burialSiteTypeFieldId = ?
          and recordDelete_timeMillis is null`)
        .run(updateForm.burialSiteTypeField, Number.parseInt(updateForm.isRequired, 10), updateForm.fieldType ?? 'text', updateForm.minLength ?? 0, updateForm.maxLength ?? 100, updateForm.pattern ?? '', updateForm.fieldValues, user.userName, Date.now(), updateForm.burialSiteTypeFieldId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName('BurialSiteTypeFields');
    return result.changes > 0;
}

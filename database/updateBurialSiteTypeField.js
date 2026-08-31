import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
const DEFAULT_MAX_LENGTH = 100;
export default function updateBurialSiteTypeField(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const result = database
        .prepare(`
      UPDATE BurialSiteTypeFields
      SET
        burialSiteTypeField = ?,
        isRequired = ?,
        fieldType = ?,
        minLength = ?,
        maxLength = ?,
        pattern = ?,
        fieldValues = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        burialSiteTypeFieldId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(updateForm.burialSiteTypeField, Math.trunc(Number(updateForm.isRequired)), updateForm.fieldType ?? 'text', updateForm.minLength ?? 0, updateForm.maxLength ?? DEFAULT_MAX_LENGTH, updateForm.pattern ?? '', updateForm.fieldValues, user.username, Date.now(), updateForm.burialSiteTypeFieldId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName('BurialSiteTypeFields');
    return result.changes > 0;
}

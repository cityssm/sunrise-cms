import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { acquireConnection } from './pool.js';
export default async function updateBurialSiteTypeField(updateForm, user) {
    const database = await acquireConnection();
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
    database.release();
    clearCacheByTableName('BurialSiteTypeFields');
    return result.changes > 0;
}

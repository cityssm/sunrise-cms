import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { clearCacheByTableName } from '../helpers/functions.cache.js';
export default function addBurialSiteTypeField(addForm, user) {
    const database = sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`insert into BurialSiteTypeFields (
        burialSiteTypeId, burialSiteTypeField,
        fieldType, fieldValues,
        isRequired, pattern,
        minLength, maxLength,
        orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(addForm.burialSiteTypeId, addForm.burialSiteTypeField, addForm.fieldType ?? 'text', addForm.fieldValues ?? '', addForm.isRequired === '' ? 0 : 1, addForm.pattern ?? '', addForm.minLength ?? 0, addForm.maxLength ?? 100, addForm.orderNumber ?? -1, user.userName, rightNowMillis, user.userName, rightNowMillis);
    database.close();
    clearCacheByTableName('BurialSiteTypeFields');
    return result.lastInsertRowid;
}

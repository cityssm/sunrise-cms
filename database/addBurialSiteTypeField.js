import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addBurialSiteTypeField(form, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`
      INSERT INTO
        BurialSiteTypeFields (
          burialSiteTypeId,
          burialSiteTypeField,
          fieldType,
          fieldValues,
          isRequired,
          pattern,
          minLength,
          maxLength,
          orderNumber,
          recordCreate_username,
          recordCreate_timeMillis,
          recordUpdate_username,
          recordUpdate_timeMillis
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
        .run(form.burialSiteTypeId, form.burialSiteTypeField, form.fieldType ?? 'text', form.fieldValues ?? '', form.isRequired === '' ? 0 : 1, form.pattern ?? '', form.minLength ?? 0, form.maxLength ?? 100, form.orderNumber ?? -1, user.username, rightNowMillis, user.username, rightNowMillis);
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName('BurialSiteTypeFields');
    return result.lastInsertRowid;
}

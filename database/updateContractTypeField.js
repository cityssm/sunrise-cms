import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
const DEFAULT_MAX_FIELD_LENGTH = 100;
export default function updateContractTypeField(updateForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const result = database
        .prepare(`
      UPDATE ContractTypeFields
      SET
        contractTypeField = ?,
        isRequired = ?,
        fieldType = ?,
        minLength = ?,
        maxLength = ?,
        pattern = ?,
        fieldValues = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        contractTypeFieldId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(updateForm.contractTypeField, Math.trunc(Number(updateForm.isRequired)), updateForm.fieldType ?? 'text', updateForm.minLength ?? 0, updateForm.maxLength ?? DEFAULT_MAX_FIELD_LENGTH, updateForm.pattern ?? '', updateForm.fieldValues, user.username, Date.now(), updateForm.contractTypeFieldId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    clearCacheByTableName('ContractTypeFields');
    return result.changes > 0;
}

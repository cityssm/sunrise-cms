import sqlite from 'better-sqlite3';
import { clearCacheByTableName } from '../helpers/cache.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function updateContractTypeField(updateForm, user) {
    const database = sqlite(sunriseDB);
    const result = database
        .prepare(`update ContractTypeFields
        set contractTypeField = ?,
          isRequired = ?,
          fieldType = ?,
          minLength = ?,
          maxLength = ?,
          pattern = ?,
          fieldValues = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where contractTypeFieldId = ?
          and recordDelete_timeMillis is null`)
        .run(updateForm.contractTypeField, Number.parseInt(updateForm.isRequired, 10), updateForm.fieldType ?? 'text', updateForm.minLength ?? 0, updateForm.maxLength ?? 100, updateForm.pattern ?? '', updateForm.fieldValues, user.userName, Date.now(), updateForm.contractTypeFieldId);
    database.close();
    clearCacheByTableName('ContractTypeFields');
    return result.changes > 0;
}

import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { acquireConnection } from './pool.js';
export default async function updateContractTypeField(updateForm, user) {
    const database = await acquireConnection();
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
    database.release();
    clearCacheByTableName('ContractTypeFields');
    return result.changes > 0;
}

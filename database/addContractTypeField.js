import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { acquireConnection } from './pool.js';
export default async function addContractTypeField(addForm, user) {
    const database = await acquireConnection();
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`insert into ContractTypeFields (
        contractTypeId, contractTypeField, fieldType,
        fieldValues, isRequired, pattern,
        minimumLength, maximumLength,
        orderNumber,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(addForm.contractTypeId ?? undefined, addForm.contractTypeField, addForm.fieldType ?? 'text', addForm.fieldValues ?? '', addForm.isRequired === '' ? 0 : 1, addForm.pattern ?? '', addForm.minimumLength ?? 0, addForm.maximumLength ?? 100, addForm.orderNumber ?? -1, user.userName, rightNowMillis, user.userName, rightNowMillis);
    database.release();
    clearCacheByTableName('OccupancyTypeFields');
    return result.lastInsertRowid;
}

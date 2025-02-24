import { clearCacheByTableName } from '../helpers/functions.cache.js';
import { acquireConnection } from './pool.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
function getCurrentField(contractTypeFieldId, connectedDatabase) {
    return connectedDatabase
        .prepare(`select contractTypeId, orderNumber
        from ContractTypeFields
        where contractTypeFieldId = ?`)
        .get(contractTypeFieldId);
}
export async function moveContractTypeFieldDown(contractTypeFieldId) {
    const database = await acquireConnection();
    const currentField = getCurrentField(contractTypeFieldId, database);
    database
        .prepare(`update ContractTypeFields
        set orderNumber = orderNumber - 1
        where recordDelete_timeMillis is null
        ${currentField.contractTypeId === undefined
        ? ' and contractTypeId is null'
        : ` and contractTypeId = '${currentField.contractTypeId.toString()}'`}
        and orderNumber = ? + 1`)
        .run(currentField.orderNumber);
    const success = updateRecordOrderNumber('ContractTypeFields', contractTypeFieldId, currentField.orderNumber + 1, database);
    database.release();
    clearCacheByTableName('ContractTypeFields');
    return success;
}
export async function moveContractTypeFieldDownToBottom(contractTypeFieldId) {
    const database = await acquireConnection();
    const currentField = getCurrentField(contractTypeFieldId, database);
    const occupancyTypeParameters = [];
    if (currentField.contractTypeId) {
        occupancyTypeParameters.push(currentField.contractTypeId);
    }
    const maxOrderNumber = database
        .prepare(`select max(orderNumber) as maxOrderNumber
          from ContractTypeFields
          where recordDelete_timeMillis is null
          ${currentField.contractTypeId === undefined
        ? ' and contractTypeId is null'
        : ' and contractTypeId = ?'}`)
        .get(occupancyTypeParameters).maxOrderNumber;
    if (currentField.orderNumber !== maxOrderNumber) {
        updateRecordOrderNumber('ContractTypeFields', contractTypeFieldId, maxOrderNumber + 1, database);
        occupancyTypeParameters.push(currentField.orderNumber);
        database
            .prepare(`update ContractTypeFields set orderNumber = orderNumber - 1
          where recordDelete_timeMillis is null
          ${currentField.contractTypeId === undefined
            ? ' and contractTypeId is null'
            : ' and contractTypeId = ?'}
          and orderNumber > ?`)
            .run(occupancyTypeParameters);
    }
    database.release();
    clearCacheByTableName('ContractTypeFields');
    return true;
}
export async function moveContractTypeFieldUp(contractTypeFieldId) {
    const database = await acquireConnection();
    const currentField = getCurrentField(contractTypeFieldId, database);
    if (currentField.orderNumber <= 0) {
        database.release();
        return true;
    }
    database
        .prepare(`update ContractTypeFields
        set orderNumber = orderNumber + 1
        where recordDelete_timeMillis is null
        ${currentField.contractTypeId === undefined
        ? ' and contractTypeId is null'
        : ` and contractTypeId = '${currentField.contractTypeId.toString()}'`}
        and orderNumber = ? - 1`)
        .run(currentField.orderNumber);
    const success = updateRecordOrderNumber('ContractTypeFields', contractTypeFieldId, currentField.orderNumber - 1, database);
    database.release();
    clearCacheByTableName('ContractTypeFields');
    return success;
}
export async function moveContractTypeFieldUpToTop(contractTypeFieldId) {
    const database = await acquireConnection();
    const currentField = getCurrentField(contractTypeFieldId, database);
    if (currentField.orderNumber > 0) {
        updateRecordOrderNumber('ContractTypeFields', contractTypeFieldId, -1, database);
        const occupancyTypeParameters = [];
        if (currentField.contractTypeId) {
            occupancyTypeParameters.push(currentField.contractTypeId);
        }
        occupancyTypeParameters.push(currentField.orderNumber);
        database
            .prepare(`update ContractTypeFields
          set orderNumber = orderNumber + 1
          where recordDelete_timeMillis is null
          ${currentField.contractTypeId
            ? ' and contractTypeId = ?'
            : ' and contractTypeId is null'} and orderNumber < ?`)
            .run(occupancyTypeParameters);
    }
    database.release();
    clearCacheByTableName('ContractTypeFields');
    return true;
}

import { acquireConnection } from './pool.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default async function getContractTypeFields(contractTypeId, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    const sqlParameters = [];
    if ((contractTypeId ?? -1) !== -1) {
        sqlParameters.push(contractTypeId);
    }
    const contractTypeFields = database
        .prepare(`select contractTypeFieldId, contractTypeField, fieldType,
        fieldValues, isRequired, pattern, minimumLength, maximumLength, orderNumber
        from ContractTypeFields
        where recordDelete_timeMillis is null
        ${(contractTypeId ?? -1) === -1
        ? ' and contractTypeId is null'
        : ' and contractTypeId = ?'}
        order by orderNumber, contractTypeField`)
        .all(sqlParameters);
    let expectedOrderNumber = 0;
    for (const contractTypeField of contractTypeFields) {
        if (contractTypeField.orderNumber !== expectedOrderNumber) {
            updateRecordOrderNumber('ContractTypeFields', contractTypeField.contractTypeFieldId, expectedOrderNumber, database);
            contractTypeField.orderNumber = expectedOrderNumber;
        }
        expectedOrderNumber += 1;
    }
    if (connectedDatabase === undefined) {
        database.release();
    }
    return contractTypeFields;
}

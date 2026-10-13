import { getDatabaseConnection } from '../helpers/database.helpers.js';
import updateRecordOrderNumber from './updateRecordOrderNumber.js';
export default function getContractTypeFields(contractTypeId, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const sqlParameters = [];
    if (contractTypeId !== undefined && contractTypeId !== -1) {
        sqlParameters.push(contractTypeId);
    }
    const contractTypeFields = database
        .prepare(`
      SELECT
        contractTypeFieldId,
        contractTypeField,
        fieldType,
        fieldValues,
        isRequired,
        pattern,
        minLength,
        maxLength,
        orderNumber
      FROM
        ContractTypeFields
      WHERE
        recordDelete_timeMillis IS NULL ${(contractTypeId ?? -1) === -1
        ? ' AND contractTypeId IS NULL'
        : ' AND contractTypeId = ?'}
      ORDER BY
        orderNumber,
        contractTypeField
    `)
        .all(...sqlParameters);
    let expectedOrderNumber = 0;
    for (const contractTypeField of contractTypeFields) {
        if (contractTypeField.orderNumber !== expectedOrderNumber) {
            updateRecordOrderNumber('ContractTypeFields', contractTypeField.contractTypeFieldId, expectedOrderNumber, database);
            contractTypeField.orderNumber = expectedOrderNumber;
        }
        expectedOrderNumber += 1;
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return contractTypeFields;
}

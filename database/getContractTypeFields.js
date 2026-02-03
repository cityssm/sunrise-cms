import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default function getContractTypeFields(contractTypeId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const updateOrderNumbers = !database.readonly && contractTypeId !== undefined;
    const sqlParameters = [];
    if ((contractTypeId ?? -1) !== -1) {
        sqlParameters.push(contractTypeId);
    }
    const contractTypeFields = database
        .prepare(/* sql */ `
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
        ? ' and contractTypeId is null'
        : ' and contractTypeId = ?'}
      ORDER BY
        orderNumber,
        contractTypeField
    `)
        .all(sqlParameters);
    if (updateOrderNumbers) {
        let expectedOrderNumber = 0;
        for (const contractTypeField of contractTypeFields) {
            if (contractTypeField.orderNumber !== expectedOrderNumber) {
                updateRecordOrderNumber('ContractTypeFields', contractTypeField.contractTypeFieldId, expectedOrderNumber, database);
                contractTypeField.orderNumber = expectedOrderNumber;
            }
            expectedOrderNumber += 1;
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return contractTypeFields;
}

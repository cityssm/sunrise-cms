"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getContractTypeFields;
const better_sqlite3_1 = require("better-sqlite3");
const database_helpers_js_1 = require("../helpers/database.helpers.js");
const updateRecordOrderNumber_js_1 = require("./updateRecordOrderNumber.js");
function getContractTypeFields(contractTypeId, connectedDatabase) {
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB);
    const updateOrderNumbers = !database.readonly && contractTypeId !== undefined;
    const sqlParameters = [];
    if ((contractTypeId !== null && contractTypeId !== void 0 ? contractTypeId : -1) !== -1) {
        sqlParameters.push(contractTypeId);
    }
    const contractTypeFields = database
        .prepare(`select contractTypeFieldId, contractTypeField, fieldType,
        fieldValues, isRequired, pattern, minLength, maxLength, orderNumber
        from ContractTypeFields
        where recordDelete_timeMillis is null
        ${(contractTypeId !== null && contractTypeId !== void 0 ? contractTypeId : -1) === -1
        ? ' and contractTypeId is null'
        : ' and contractTypeId = ?'}
        order by orderNumber, contractTypeField`)
        .all(sqlParameters);
    if (updateOrderNumbers) {
        let expectedOrderNumber = 0;
        for (const contractTypeField of contractTypeFields) {
            if (contractTypeField.orderNumber !== expectedOrderNumber) {
                (0, updateRecordOrderNumber_js_1.updateRecordOrderNumber)('ContractTypeFields', contractTypeField.contractTypeFieldId, expectedOrderNumber, database);
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

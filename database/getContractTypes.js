"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getContractTypes;
const better_sqlite3_1 = require("better-sqlite3");
const database_helpers_js_1 = require("../helpers/database.helpers.js");
const getContractTypeFields_js_1 = require("./getContractTypeFields.js");
const getContractTypePrints_js_1 = require("./getContractTypePrints.js");
const updateRecordOrderNumber_js_1 = require("./updateRecordOrderNumber.js");
function getContractTypes(includeDeleted = false, connectedDatabase) {
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB);
    const updateOrderNumbers = !includeDeleted;
    const contractTypes = database
        .prepare(`select contractTypeId, contractType, isPreneed, orderNumber
        from ContractTypes
        ${includeDeleted ? '' : ' where recordDelete_timeMillis is null '} 
        order by orderNumber, contractType, contractTypeId`)
        .all();
    let expectedOrderNumber = -1;
    for (const contractType of contractTypes) {
        expectedOrderNumber += 1;
        if (updateOrderNumbers &&
            contractType.orderNumber !== expectedOrderNumber) {
            (0, updateRecordOrderNumber_js_1.updateRecordOrderNumber)('ContractTypes', contractType.contractTypeId, expectedOrderNumber, database);
            contractType.orderNumber = expectedOrderNumber;
        }
        contractType.contractTypeFields = (0, getContractTypeFields_js_1.default)(contractType.contractTypeId, database);
        contractType.contractTypePrints = (0, getContractTypePrints_js_1.default)(contractType.contractTypeId, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return contractTypes;
}

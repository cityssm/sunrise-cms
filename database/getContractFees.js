"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getContractFees;
const better_sqlite3_1 = require("better-sqlite3");
const database_helpers_js_1 = require("../helpers/database.helpers.js");
function getContractFees(contractId, connectedDatabase) {
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB, { readonly: true });
    const fees = database
        .prepare(`select o.contractId, o.feeId,
        c.feeCategory, f.feeName,
        f.includeQuantity, o.feeAmount, o.taxAmount, o.quantity, f.quantityUnit
        from ContractFees o
        left join Fees f on o.feeId = f.feeId
        left join FeeCategories c on f.feeCategoryId = c.feeCategoryId
        where o.recordDelete_timeMillis is null
        and o.contractId = ?
        order by o.recordCreate_timeMillis`)
        .all(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return fees;
}

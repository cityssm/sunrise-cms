"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getContractField;
const better_sqlite3_1 = require("better-sqlite3");
const database_helpers_js_1 = require("../helpers/database.helpers.js");
function getContractField(contractId, connectedDatabase) {
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB, { readonly: true });
    const fields = database
        .prepare(`select o.contractId, o.contractTypeFieldId,
        o.fieldValue, f.contractTypeField, f.fieldType, f.fieldValues,
        f.isRequired, f.pattern, f.minLength, f.maxLength,
        f.orderNumber, t.orderNumber as contractTypeOrderNumber
        from ContractFields o
        left join ContractTypeFields f on o.contractTypeFieldId = f.contractTypeFieldId
        left join ContractTypes t on f.contractTypeId = t.contractTypeId
        where o.recordDelete_timeMillis is null
        and o.contractId = ?
        
        union
        
        select ? as contractId, f.contractTypeFieldId,
        '' as fieldValue, f.contractTypeField, f.fieldType, f.fieldValues,
        f.isRequired, f.pattern, f.minLength, f.maxLength,
        f.orderNumber, t.orderNumber as contractTypeOrderNumber
        from ContractTypeFields f
        left join ContractTypes t on f.contractTypeId = t.contractTypeId
        where f.recordDelete_timeMillis is null and (
          f.contractTypeId is null
          or f.contractTypeId in (select contractTypeId from Contracts where contractId = ?))
        and f.contractTypeFieldId not in (select contractTypeFieldId from ContractFields where contractId = ? and recordDelete_timeMillis is null)
        order by contractTypeOrderNumber, f.orderNumber, f.contractTypeField`)
        .all(contractId, contractId, contractId, contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return fields;
}

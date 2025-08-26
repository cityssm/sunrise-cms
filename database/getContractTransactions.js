"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GetContractTransactions;
const utils_datetime_1 = require("@cityssm/utils-datetime");
const better_sqlite3_1 = require("better-sqlite3");
const config_helpers_js_1 = require("../helpers/config.helpers.js");
const database_helpers_js_1 = require("../helpers/database.helpers.js");
const helpers_js_1 = require("../integrations/dynamicsGp/helpers.js");
async function GetContractTransactions(contractId, options, connectedDatabase) {
    var _a, _b;
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB, { readonly: true });
    database.function('userFn_dateIntegerToString', utils_datetime_1.dateIntegerToString);
    database.function('userFn_timeIntegerToString', utils_datetime_1.timeIntegerToString);
    const contractTransactions = database
        .prepare(`select contractId, transactionIndex,
          transactionDate, userFn_dateIntegerToString(transactionDate) as transactionDateString,
          transactionTime, userFn_timeIntegerToString(transactionTime) as transactionTimeString,
          transactionAmount, externalReceiptNumber, isInvoiced, transactionNote
        from ContractTransactions
        where recordDelete_timeMillis is null
          and contractId = ?
        order by transactionDate, transactionTime, transactionIndex`)
        .all(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    if (options.includeIntegrations &&
        (0, config_helpers_js_1.getConfigProperty)('integrations.dynamicsGP.integrationIsEnabled')) {
        for (const transaction of contractTransactions) {
            if (((_a = transaction.externalReceiptNumber) !== null && _a !== void 0 ? _a : '') !== '') {
                const gpDocument = await (0, helpers_js_1.getDynamicsGPDocument)((_b = transaction.externalReceiptNumber) !== null && _b !== void 0 ? _b : '');
                if (gpDocument !== undefined) {
                    transaction.dynamicsGPDocument = gpDocument;
                }
            }
        }
    }
    return contractTransactions;
}

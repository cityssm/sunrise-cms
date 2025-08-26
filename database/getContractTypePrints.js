"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getContractTypePrints;
const better_sqlite3_1 = require("better-sqlite3");
const config_helpers_js_1 = require("../helpers/config.helpers.js");
const database_helpers_js_1 = require("../helpers/database.helpers.js");
const availablePrints = (0, config_helpers_js_1.getConfigProperty)('settings.contracts.prints');
// eslint-disable-next-line @typescript-eslint/naming-convention
const userFunction_configContainsPrintEJS = (printEJS) => {
    if (printEJS === '*' || availablePrints.includes(printEJS)) {
        return 1;
    }
    return 0;
};
function getContractTypePrints(contractTypeId, connectedDatabase) {
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB);
    database.function(
    // eslint-disable-next-line no-secrets/no-secrets
    'userFn_configContainsPrintEJS', userFunction_configContainsPrintEJS);
    const results = database
        .prepare(`select printEJS, orderNumber
        from ContractTypePrints
        where recordDelete_timeMillis is null
        and contractTypeId = ?
        and userFn_configContainsPrintEJS(printEJS) = 1
        order by orderNumber, printEJS`)
        .all(contractTypeId);
    let expectedOrderNumber = -1;
    const prints = [];
    for (const result of results) {
        expectedOrderNumber += 1;
        if (result.orderNumber !== expectedOrderNumber) {
            database
                .prepare(`update ContractTypePrints
            set orderNumber = ?
            where contractTypeId = ?
            and printEJS = ?`)
                .run(expectedOrderNumber, contractTypeId, result.printEJS);
        }
        prints.push(result.printEJS);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return prints;
}

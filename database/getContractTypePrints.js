import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
const availablePrints = getConfigProperty('settings.contracts.prints');
// eslint-disable-next-line @typescript-eslint/naming-convention
const userFunction_configContainsPrintEJS = (printEJS) => {
    if (printEJS === '*' || availablePrints.includes(printEJS)) {
        return 1;
    }
    return 0;
};
export default function getContractTypePrints(contractTypeId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    database.function(
    // eslint-disable-next-line no-secrets/no-secrets
    'userFn_configContainsPrintEJS', userFunction_configContainsPrintEJS);
    const results = database
        .prepare(/* sql */ `select printEJS, orderNumber
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
                .prepare(/* sql */ `update ContractTypePrints
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

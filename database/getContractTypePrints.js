import { getConfigProperty } from '../helpers/config.helpers.js';
import { acquireConnection } from './pool.js';
const availablePrints = getConfigProperty('settings.contracts.prints');
// eslint-disable-next-line @typescript-eslint/naming-convention
const userFunction_configContainsPrintEJS = (printEJS) => {
    if (printEJS === '*' || availablePrints.includes(printEJS)) {
        return 1;
    }
    return 0;
};
export default async function getContractTypePrints(contractTypeId, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
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
        database.release();
    }
    return prints;
}

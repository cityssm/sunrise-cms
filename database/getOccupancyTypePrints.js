import { getConfigProperty } from '../helpers/config.helpers.js';
import { acquireConnection } from './pool.js';
const availablePrints = getConfigProperty('settings.lotOccupancy.prints');
// eslint-disable-next-line @typescript-eslint/naming-convention
const userFunction_configContainsPrintEJS = (printEJS) => {
    if (printEJS === '*' || availablePrints.includes(printEJS)) {
        return 1;
    }
    return 0;
};
export default async function getOccupancyTypePrints(occupancyTypeId, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    database.function(
    // eslint-disable-next-line no-secrets/no-secrets
    'userFn_configContainsPrintEJS', userFunction_configContainsPrintEJS);
    const results = database
        .prepare(`select printEJS, orderNumber
        from OccupancyTypePrints
        where recordDelete_timeMillis is null
        and occupancyTypeId = ?
        and userFn_configContainsPrintEJS(printEJS) = 1
        order by orderNumber, printEJS`)
        .all(occupancyTypeId);
    let expectedOrderNumber = -1;
    const prints = [];
    for (const result of results) {
        expectedOrderNumber += 1;
        if (result.orderNumber !== expectedOrderNumber) {
            database
                .prepare(`update OccupancyTypePrints
            set orderNumber = ?
            where occupancyTypeId = ?
            and printEJS = ?`)
                .run(expectedOrderNumber, occupancyTypeId, result.printEJS);
        }
        prints.push(result.printEJS);
    }
    if (connectedDatabase === undefined) {
        database.release();
    }
    return prints;
}

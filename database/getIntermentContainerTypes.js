import { acquireConnection } from './pool.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default async function getIntermentContainerTypes() {
    const database = await acquireConnection();
    const containerTypes = database
        .prepare(`select intermentContainerTypeId, intermentContainerType, intermentContainerTypeKey, isCremationType, orderNumber
        from IntermentContainerTypes
        where recordDelete_timeMillis is null
        order by isCremationType, orderNumber, intermentContainerType, intermentContainerTypeId`)
        .all();
    let expectedOrderNumber = -1;
    for (const containerType of containerTypes) {
        expectedOrderNumber += 1;
        if (containerType.orderNumber !== expectedOrderNumber) {
            updateRecordOrderNumber('IntermentContainerTypes', containerType.intermentContainerTypeId, expectedOrderNumber, database);
            containerType.orderNumber = expectedOrderNumber;
        }
    }
    database.release();
    return containerTypes;
}

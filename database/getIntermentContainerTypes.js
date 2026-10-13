import { getDatabaseConnection } from '../helpers/database.helpers.js';
import updateRecordOrderNumber from './updateRecordOrderNumber.js';
export default function getIntermentContainerTypes(shouldIncludeDeletedRecords = false, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const updateOrderNumbers = !shouldIncludeDeletedRecords;
    const containerTypes = database
        .prepare(`
      SELECT
        intermentContainerTypeId,
        intermentContainerType,
        intermentContainerTypeKey,
        isCremationType,
        isAvailableOnPortal,
        orderNumber
      FROM
        IntermentContainerTypes ${shouldIncludeDeletedRecords
        ? ''
        : ' WHERE recordDelete_timeMillis IS NULL '}
      ORDER BY
        isCremationType,
        orderNumber,
        intermentContainerType,
        intermentContainerTypeId
    `)
        .all();
    if (updateOrderNumbers) {
        let expectedOrderNumber = -1;
        for (const containerType of containerTypes) {
            expectedOrderNumber += 1;
            if (containerType.orderNumber === expectedOrderNumber) {
                continue;
            }
            updateRecordOrderNumber('IntermentContainerTypes', containerType.intermentContainerTypeId, expectedOrderNumber, database);
            containerType.orderNumber = expectedOrderNumber;
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return containerTypes;
}

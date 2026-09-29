import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
import updateRecordOrderNumber from './updateRecordOrderNumber.js';
export default function getIntermentContainerTypes(includeDeleted = false, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    const updateOrderNumbers = !includeDeleted;
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
        IntermentContainerTypes ${includeDeleted
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

import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
import updateRecordOrderNumber from './updateRecordOrderNumber.js';
export default function getServiceTypes(includeDeleted = false, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    const updateOrderNumbers = !includeDeleted;
    const serviceTypes = database
        .prepare(`
      SELECT
        serviceTypeId,
        serviceType,
        isAvailableOnPortal,
        orderNumber
      FROM
        ServiceTypes ${includeDeleted
        ? ''
        : ' WHERE recordDelete_timeMillis IS NULL '}
      ORDER BY
        orderNumber,
        serviceType,
        serviceTypeId
    `)
        .all();
    if (updateOrderNumbers) {
        let expectedOrderNumber = -1;
        for (const serviceType of serviceTypes) {
            expectedOrderNumber += 1;
            if (serviceType.orderNumber === expectedOrderNumber) {
                continue;
            }
            updateRecordOrderNumber('ServiceTypes', serviceType.serviceTypeId, expectedOrderNumber, database);
            serviceType.orderNumber = expectedOrderNumber;
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return serviceTypes;
}

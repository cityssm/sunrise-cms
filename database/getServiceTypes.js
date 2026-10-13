import { getDatabaseConnection } from '../helpers/database.helpers.js';
import updateRecordOrderNumber from './updateRecordOrderNumber.js';
export default function getServiceTypes(shouldIncludeDeletedRecords = false, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const updateOrderNumbers = !shouldIncludeDeletedRecords;
    const serviceTypes = database
        .prepare(`
      SELECT
        serviceTypeId,
        serviceType,
        isAvailableOnPortal,
        orderNumber
      FROM
        ServiceTypes ${shouldIncludeDeletedRecords
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

import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default function getServiceTypes(includeDeleted = false, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const updateOrderNumbers = !database.readonly && !includeDeleted;
    const serviceTypes = database
        .prepare(`
      SELECT
        serviceTypeId,
        serviceType,
        orderNumber
      FROM
        ServiceTypes ${includeDeleted
        ? ''
        : ' where recordDelete_timeMillis IS NULL '}
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
            if (serviceType.orderNumber !== expectedOrderNumber) {
                updateRecordOrderNumber('ServiceTypes', serviceType.serviceTypeId, expectedOrderNumber, database);
                serviceType.orderNumber = expectedOrderNumber;
            }
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return serviceTypes;
}

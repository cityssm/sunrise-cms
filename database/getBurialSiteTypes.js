import { getDatabaseConnection } from '../helpers/database.helpers.js';
import getBurialSiteTypeFields from './getBurialSiteTypeFields.js';
import updateRecordOrderNumber from './updateRecordOrderNumber.js';
export default function getBurialSiteTypes(shouldIncludeDeletedRecords = false, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const shouldUpdateOrderNumbers = !shouldIncludeDeletedRecords;
    const burialSiteTypes = database
        .prepare(`
      SELECT
        burialSiteTypeId,
        burialSiteType,
        bodyCapacityMax,
        crematedCapacityMax,
        isAvailableOnPortal,
        orderNumber
      FROM
        BurialSiteTypes ${shouldIncludeDeletedRecords
        ? ''
        : ' WHERE recordDelete_timeMillis IS NULL '}
      ORDER BY
        orderNumber,
        burialSiteType
    `)
        .all();
    let expectedOrderNumber = -1;
    for (const burialSiteType of burialSiteTypes) {
        expectedOrderNumber += 1;
        if (shouldUpdateOrderNumbers &&
            burialSiteType.orderNumber !== expectedOrderNumber) {
            updateRecordOrderNumber('BurialSiteTypes', burialSiteType.burialSiteTypeId, expectedOrderNumber, database);
            burialSiteType.orderNumber = expectedOrderNumber;
        }
        burialSiteType.burialSiteTypeFields = getBurialSiteTypeFields(burialSiteType.burialSiteTypeId, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return burialSiteTypes;
}

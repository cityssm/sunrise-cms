import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import getBurialSiteTypeFields from './getBurialSiteTypeFields.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default function getBurialSiteTypes() {
    const database = sqlite(sunriseDB);
    const burialSiteTypes = database
        .prepare(`select burialSiteTypeId, burialSiteType, orderNumber
        from BurialSiteTypes
        where recordDelete_timeMillis is null
        order by orderNumber, burialSiteType`)
        .all();
    let expectedOrderNumber = -1;
    for (const burialSiteType of burialSiteTypes) {
        expectedOrderNumber += 1;
        if (burialSiteType.orderNumber !== expectedOrderNumber) {
            updateRecordOrderNumber('BurialSiteTypes', burialSiteType.burialSiteTypeId, expectedOrderNumber, database);
            burialSiteType.orderNumber = expectedOrderNumber;
        }
        burialSiteType.burialSiteTypeFields = getBurialSiteTypeFields(burialSiteType.burialSiteTypeId, database);
    }
    database.close();
    return burialSiteTypes;
}

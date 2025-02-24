import { acquireConnection } from './pool.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default async function getBurialSiteTypeFields(burialSiteTypeId, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    const typeFields = database
        .prepare(`select burialSiteTypeFieldId,
        burialSiteTypeField, fieldType, fieldValues,
        isRequired, pattern, minimumLength, maximumLength, orderNumber
        from BurialSiteTypeFields
        where recordDelete_timeMillis is null
        and burialSiteTypeId = ?
        order by orderNumber, burialSiteTypeField`)
        .all(burialSiteTypeId);
    let expectedOrderNumber = 0;
    for (const typeField of typeFields) {
        if (typeField.orderNumber !== expectedOrderNumber) {
            updateRecordOrderNumber('BurialSiteTypeFields', typeField.burialSiteTypeFieldId, expectedOrderNumber, database);
            typeField.orderNumber = expectedOrderNumber;
        }
        expectedOrderNumber += 1;
    }
    if (connectedDatabase === undefined) {
        database.release();
    }
    return typeFields;
}

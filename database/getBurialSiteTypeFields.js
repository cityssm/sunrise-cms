import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default function getBurialSiteTypeFields(burialSiteTypeId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const updateOrderNumbers = !database.readonly;
    const typeFields = database
        .prepare(/* sql */ `
      SELECT
        burialSiteTypeFieldId,
        burialSiteTypeField,
        fieldType,
        fieldValues,
        isRequired,
        pattern,
        minLength,
        maxLength,
        orderNumber
      FROM
        BurialSiteTypeFields
      WHERE
        recordDelete_timeMillis IS NULL
        AND burialSiteTypeId = ?
      ORDER BY
        orderNumber,
        burialSiteTypeField
    `)
        .all(burialSiteTypeId);
    if (updateOrderNumbers) {
        let expectedOrderNumber = 0;
        for (const typeField of typeFields) {
            if (typeField.orderNumber !== expectedOrderNumber) {
                updateRecordOrderNumber('BurialSiteTypeFields', typeField.burialSiteTypeFieldId, expectedOrderNumber, database);
                typeField.orderNumber = expectedOrderNumber;
            }
            expectedOrderNumber += 1;
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return typeFields;
}

import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default function getIntermentContainerTypes(includeDeleted = false, connectedDatabase = undefined) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const updateOrderNumbers = !database.readonly && !includeDeleted;
    const containerTypes = database
        .prepare(/* sql */ `
      SELECT
        intermentContainerTypeId,
        intermentContainerType,
        intermentContainerTypeKey,
        isCremationType,
        orderNumber
      FROM
        IntermentContainerTypes ${includeDeleted
        ? ''
        : ' where recordDelete_timeMillis is null '}
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
            if (containerType.orderNumber !== expectedOrderNumber) {
                updateRecordOrderNumber('IntermentContainerTypes', containerType.intermentContainerTypeId, expectedOrderNumber, database);
                containerType.orderNumber = expectedOrderNumber;
            }
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return containerTypes;
}

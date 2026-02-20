import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default function getIntermentDepths(includeDeleted = false, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const updateOrderNumbers = !database.readonly && !includeDeleted;
    const intermentDepths = database
        .prepare(/* sql */ `
      SELECT
        intermentDepthId,
        intermentDepth,
        intermentDepthKey,
        orderNumber
      FROM
        IntermentDepths ${includeDeleted
        ? ''
        : ' where recordDelete_timeMillis is null '}
      ORDER BY
        orderNumber,
        intermentDepth,
        intermentDepthId
    `)
        .all();
    if (updateOrderNumbers) {
        let expectedOrderNumber = -1;
        for (const intermentDepth of intermentDepths) {
            expectedOrderNumber += 1;
            if (intermentDepth.orderNumber !== expectedOrderNumber) {
                updateRecordOrderNumber('IntermentDepths', intermentDepth.intermentDepthId, expectedOrderNumber, database);
                intermentDepth.orderNumber = expectedOrderNumber;
            }
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return intermentDepths;
}

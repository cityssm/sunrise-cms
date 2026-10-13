import { getDatabaseConnection } from '../helpers/database.helpers.js';
import updateRecordOrderNumber from './updateRecordOrderNumber.js';
export default function getIntermentDepths(shouldIncludeDeletedRecords = false, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const updateOrderNumbers = !shouldIncludeDeletedRecords;
    const intermentDepths = database
        .prepare(`
      SELECT
        intermentDepthId,
        intermentDepth,
        intermentDepthKey,
        isAvailableOnPortal,
        orderNumber
      FROM
        IntermentDepths ${shouldIncludeDeletedRecords
        ? ''
        : ' WHERE recordDelete_timeMillis IS NULL '}
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
            if (intermentDepth.orderNumber === expectedOrderNumber) {
                continue;
            }
            updateRecordOrderNumber('IntermentDepths', intermentDepth.intermentDepthId, expectedOrderNumber, database);
            intermentDepth.orderNumber = expectedOrderNumber;
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return intermentDepths;
}

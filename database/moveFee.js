import { getDatabaseConnection } from '../helpers/database.helpers.js';
import getFee from './getFee.js';
import updateRecordOrderNumber from './updateRecordOrderNumber.js';
export function moveFeeDown(feeId, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const currentFee = getFee(feeId, database);
    database
        .prepare(`
      UPDATE Fees
      SET
        orderNumber = orderNumber - 1
      WHERE
        recordDelete_timeMillis IS NULL
        AND feeCategoryId = ?
        AND orderNumber = ? + 1
    `)
        .run(currentFee.feeCategoryId, currentFee.orderNumber);
    const wasSuccessful = updateRecordOrderNumber('Fees', feeId, currentFee.orderNumber + 1, database);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return wasSuccessful;
}
export function moveFeeDownToBottom(feeId, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const currentFee = getFee(feeId, database);
    const maxOrderNumber = database
        .prepare(`
        SELECT
          MAX(orderNumber) AS maxOrderNumber
        FROM
          Fees
        WHERE
          recordDelete_timeMillis IS NULL
          AND feeCategoryId = ?
      `)
        .get(currentFee.feeCategoryId).maxOrderNumber;
    if (currentFee.orderNumber !== maxOrderNumber) {
        updateRecordOrderNumber('Fees', feeId, maxOrderNumber + 1, database);
        database
            .prepare(`
        UPDATE Fees
        SET
          orderNumber = orderNumber - 1
        WHERE
          recordDelete_timeMillis IS NULL
          AND feeCategoryId = ?
          AND orderNumber > ?
      `)
            .run(currentFee.feeCategoryId, currentFee.orderNumber);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return true;
}
export function moveFeeUp(feeId, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const currentFee = getFee(feeId, database);
    if (currentFee.orderNumber <= 0) {
        if (connectedDatabase === undefined) {
            database.close();
        }
        return true;
    }
    database
        .prepare(`
      UPDATE Fees
      SET
        orderNumber = orderNumber + 1
      WHERE
        recordDelete_timeMillis IS NULL
        AND feeCategoryId = ?
        AND orderNumber = ? - 1
    `)
        .run(currentFee.feeCategoryId, currentFee.orderNumber);
    const wasSuccessful = updateRecordOrderNumber('Fees', feeId, currentFee.orderNumber - 1, database);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return wasSuccessful;
}
export function moveFeeUpToTop(feeId, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const currentFee = getFee(feeId, database);
    if (currentFee.orderNumber > 0) {
        updateRecordOrderNumber('Fees', feeId, -1, database);
        database
            .prepare(`
        UPDATE Fees
        SET
          orderNumber = orderNumber + 1
        WHERE
          recordDelete_timeMillis IS NULL
          AND feeCategoryId = ?
          AND orderNumber < ?
      `)
            .run(currentFee.feeCategoryId, currentFee.orderNumber);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return true;
}
export default moveFeeUp;

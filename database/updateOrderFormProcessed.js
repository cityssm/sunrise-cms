import getObjectDifference from '@cityssm/object-difference';
import { isAuditLoggingEnabled } from '../helpers/config.helpers.js';
import { getDatabaseConnection } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
export default function updateOrderFormProcessed(orderFormId, isOrderFormProcessed = true, user, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const recordBefore = isAuditLoggingEnabled
        ? database
            .prepare(`
          SELECT
            *
          FROM
            OrderForms
          WHERE
            orderFormId = ?
            AND recordDelete_timeMillis IS NULL
        `)
            .get(Number(orderFormId))
        : undefined;
    const result = database
        .prepare(`
      UPDATE OrderForms
      SET
        isOrderFormProcessed = ?
      WHERE
        orderFormId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(isOrderFormProcessed ? 1 : 0, Number(orderFormId));
    if (isAuditLoggingEnabled &&
        recordBefore !== undefined &&
        result.changes > 0) {
        const recordAfter = database
            .prepare(`
        SELECT
          *
        FROM
          OrderForms
        WHERE
          orderFormId = ?
      `)
            .get(Number(orderFormId));
        const differences = getObjectDifference(recordBefore, recordAfter);
        if (differences.length > 0) {
            createAuditLogEntries({
                mainRecordId: orderFormId,
                mainRecordType: 'orderForm',
                updateTable: 'OrderForms'
            }, differences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}

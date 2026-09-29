import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
import updateRecordOrderNumber from './updateRecordOrderNumber.js';
export default function getWorkOrderTypes(connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    const workOrderTypes = database
        .prepare(`
      SELECT
        workOrderTypeId,
        workOrderType,
        orderNumber
      FROM
        WorkOrderTypes
      WHERE
        recordDelete_timeMillis IS NULL
      ORDER BY
        orderNumber,
        workOrderType
    `)
        .all();
    let expectedOrderNumber = 0;
    for (const workOrderType of workOrderTypes) {
        if (workOrderType.orderNumber !== expectedOrderNumber) {
            updateRecordOrderNumber('WorkOrderTypes', workOrderType.workOrderTypeId, expectedOrderNumber, database);
            workOrderType.orderNumber = expectedOrderNumber;
        }
        expectedOrderNumber += 1;
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return workOrderTypes;
}

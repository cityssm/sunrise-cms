import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default function getWorkOrderMilestoneTypes(includeDeleted = false, connectedDatabase = undefined) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const updateOrderNumbers = !includeDeleted;
    const workOrderMilestoneTypes = database
        .prepare(/* sql */ `
      SELECT
        workOrderMilestoneTypeId,
        workOrderMilestoneType,
        orderNumber
      FROM
        WorkOrderMilestoneTypes ${includeDeleted
        ? ''
        : ' where recordDelete_timeMillis is null '}
      ORDER BY
        orderNumber,
        workOrderMilestoneType
    `)
        .all();
    if (updateOrderNumbers) {
        let expectedOrderNumber = 0;
        for (const workOrderMilestoneType of workOrderMilestoneTypes) {
            if (workOrderMilestoneType.orderNumber !== expectedOrderNumber) {
                updateRecordOrderNumber('WorkOrderMilestoneTypes', workOrderMilestoneType.workOrderMilestoneTypeId, expectedOrderNumber, database);
                workOrderMilestoneType.orderNumber = expectedOrderNumber;
            }
            expectedOrderNumber += 1;
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return workOrderMilestoneTypes;
}

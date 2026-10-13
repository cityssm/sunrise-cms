import { getDatabaseConnection } from '../helpers/database.helpers.js';
import updateRecordOrderNumber from './updateRecordOrderNumber.js';
export default function getWorkOrderMilestoneTypes(shouldIncludeDeletedRecords = false, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const updateOrderNumbers = !shouldIncludeDeletedRecords;
    const workOrderMilestoneTypes = database
        .prepare(`
      SELECT
        workOrderMilestoneTypeId,
        workOrderMilestoneType,
        orderNumber
      FROM
        WorkOrderMilestoneTypes ${shouldIncludeDeletedRecords
        ? ''
        : ' WHERE recordDelete_timeMillis IS NULL '}
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

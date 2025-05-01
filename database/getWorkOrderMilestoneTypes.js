import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default function getWorkOrderMilestoneTypes(includeDeleted = false) {
    const database = sqlite(sunriseDB);
    const updateOrderNumbers = !includeDeleted;
    const workOrderMilestoneTypes = database
        .prepare(`select workOrderMilestoneTypeId, workOrderMilestoneType, orderNumber
        from WorkOrderMilestoneTypes
        ${includeDeleted ? '' : ' where recordDelete_timeMillis is null '}
        order by orderNumber, workOrderMilestoneType`)
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
    database.close();
    return workOrderMilestoneTypes;
}

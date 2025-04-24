import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default function getWorkOrderTypes() {
    const database = sqlite(sunriseDB);
    const workOrderTypes = database
        .prepare(`select workOrderTypeId, workOrderType, orderNumber
        from WorkOrderTypes
        where recordDelete_timeMillis is null
        order by orderNumber, workOrderType`)
        .all();
    let expectedOrderNumber = 0;
    for (const workOrderType of workOrderTypes) {
        if (workOrderType.orderNumber !== expectedOrderNumber) {
            updateRecordOrderNumber('WorkOrderTypes', workOrderType.workOrderTypeId, expectedOrderNumber, database);
            workOrderType.orderNumber = expectedOrderNumber;
        }
        expectedOrderNumber += 1;
    }
    database.close();
    return workOrderTypes;
}

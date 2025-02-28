import { dateStringToInteger, dateToInteger } from '@cityssm/utils-datetime';
import addWorkOrderContract from './addWorkOrderContract.js';
import getNextWorkOrderNumber from './getNextWorkOrderNumber.js';
import { acquireConnection } from './pool.js';
export default async function addWorkOrder(workOrderForm, user) {
    const database = await acquireConnection();
    const rightNow = new Date();
    let workOrderNumber = workOrderForm.workOrderNumber;
    if ((workOrderNumber ?? '') === '') {
        workOrderNumber = await getNextWorkOrderNumber(database);
    }
    const result = database
        .prepare(`insert into WorkOrders (
        workOrderTypeId, workOrderNumber, workOrderDescription,
        workOrderOpenDate, workOrderCloseDate,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(workOrderForm.workOrderTypeId, workOrderNumber, workOrderForm.workOrderDescription, (workOrderForm.workOrderOpenDateString ?? '') === ''
        ? dateToInteger(rightNow)
        : dateStringToInteger(workOrderForm.workOrderOpenDateString), (workOrderForm.workOrderCloseDateString ?? '') === ''
        ? undefined
        : dateStringToInteger(workOrderForm.workOrderCloseDateString), user.userName, rightNow.getTime(), user.userName, rightNow.getTime());
    const workOrderId = result.lastInsertRowid;
    if ((workOrderForm.contractId ?? '') !== '') {
        await addWorkOrderContract({
            workOrderId,
            contractId: workOrderForm.contractId
        }, user, database);
    }
    database.release();
    return workOrderId;
}

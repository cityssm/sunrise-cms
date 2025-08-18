import { dateStringToInteger, dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import addWorkOrderContract from './addWorkOrderContract.js';
import getNextWorkOrderNumber from './getNextWorkOrderNumber.js';
export default function addWorkOrder(workOrderForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNow = new Date();
    let workOrderNumber = workOrderForm.workOrderNumber;
    if ((workOrderNumber ?? '') === '') {
        workOrderNumber = getNextWorkOrderNumber(database);
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
        addWorkOrderContract({
            contractId: workOrderForm.contractId,
            workOrderId
        }, user, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return workOrderId;
}

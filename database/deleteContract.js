import { dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export function deleteContract(contractId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    /*
     * Ensure no active work orders reference the contract
     */
    const currentDateInteger = dateToInteger(new Date());
    const activeWorkOrder = database
        .prepare(`select workOrderId
        from WorkOrders
        where recordDelete_timeMillis is null
          and workOrderId in (select workOrderId from WorkOrderContracts where contractId = ? and recordDelete_timeMillis is null)
          and (workOrderCloseDate is null or workOrderCloseDate >= ?)`)
        .pluck()
        .get(contractId, currentDateInteger);
    if (activeWorkOrder !== undefined) {
        if (connectedDatabase === undefined) {
            database.close();
        }
        return false;
    }
    /*
     * Delete the contract
     */
    const rightNowMillis = Date.now();
    for (const tableName of ['Contracts', 'ContractFields', 'ContractComments']) {
        database
            .prepare(`update ${tableName}
          set recordDelete_userName = ?,
            recordDelete_timeMillis = ?
          where contractId = ?
            and recordDelete_timeMillis is null`)
            .run(user.userName, rightNowMillis, contractId);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return true;
}

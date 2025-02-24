import { dateIntegerToString } from '@cityssm/utils-datetime';
import getBurialSiteContracts from './getBurialSiteContracts.js';
import getBurialSites from './getBurialSites.js';
import getWorkOrderComments from './getWorkOrderComments.js';
import getWorkOrderMilestones from './getWorkOrderMilestones.js';
import { acquireConnection } from './pool.js';
const baseSQL = `select w.workOrderId,
    w.workOrderTypeId, t.workOrderType,
    w.workOrderNumber, w.workOrderDescription,
    w.workOrderOpenDate, userFn_dateIntegerToString(w.workOrderOpenDate) as workOrderOpenDateString,
    w.workOrderCloseDate, userFn_dateIntegerToString(w.workOrderCloseDate) as workOrderCloseDateString,
    w.recordCreate_timeMillis, w.recordUpdate_timeMillis
    from WorkOrders w
    left join WorkOrderTypes t on w.workOrderTypeId = t.workOrderTypeId
    where w.recordDelete_timeMillis is null`;
async function _getWorkOrder(sql, workOrderIdOrWorkOrderNumber, options, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    const workOrder = database.prepare(sql).get(workOrderIdOrWorkOrderNumber);
    if (workOrder !== undefined) {
        if (options.includeBurialSites) {
            const burialSiteResults = await getBurialSites({
                workOrderId: workOrder.workOrderId
            }, {
                limit: -1,
                offset: 0,
                includeLotOccupancyCount: false
            }, database);
            workOrder.workOrderBurialSites = burialSiteResults.lots;
            const workOrderBurialSiteContractsResults = await getBurialSiteContracts({
                workOrderId: workOrder.workOrderId
            }, {
                limit: -1,
                offset: 0,
                includeOccupants: true,
                includeFees: false,
                includeTransactions: false
            }, database);
            workOrder.workOrderBurialSiteContracts =
                workOrderBurialSiteContractsResults.BurialSiteContracts;
        }
        if (options.includeComments) {
            workOrder.workOrderComments = await getWorkOrderComments(workOrder.workOrderId, database);
        }
        if (options.includeMilestones) {
            workOrder.workOrderMilestones = await getWorkOrderMilestones({
                workOrderId: workOrder.workOrderId
            }, {
                includeWorkOrders: false,
                orderBy: 'completion'
            }, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.release();
    }
    return workOrder;
}
export async function getWorkOrderByWorkOrderNumber(workOrderNumber) {
    return await _getWorkOrder(`${baseSQL} and w.workOrderNumber = ?`, workOrderNumber, {
        includeBurialSites: true,
        includeComments: true,
        includeMilestones: true
    });
}
export default async function getWorkOrder(workOrderId, options, connectedDatabase) {
    return await _getWorkOrder(`${baseSQL} and w.workOrderId = ?`, workOrderId, options, connectedDatabase);
}

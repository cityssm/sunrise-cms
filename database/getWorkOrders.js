import { dateIntegerToString, dateStringToInteger } from '@cityssm/utils-datetime';
import { getBurialSiteNameWhereClause, getOccupantNameWhereClause } from '../helpers/functions.sqlFilters.js';
import getContracts from './getContracts.js';
import getBurialSites from './getBurialSites.js';
import getWorkOrderComments from './getWorkOrderComments.js';
import getWorkOrderMilestones from './getWorkOrderMilestones.js';
import { acquireConnection } from './pool.js';
function buildWhereClause(filters) {
    let sqlWhereClause = ' where w.recordDelete_timeMillis is null';
    const sqlParameters = [];
    if ((filters.workOrderTypeId ?? '') !== '') {
        sqlWhereClause += ' and w.workOrderTypeId = ?';
        sqlParameters.push(filters.workOrderTypeId);
    }
    if ((filters.workOrderOpenStatus ?? '') !== '') {
        if (filters.workOrderOpenStatus === 'open') {
            sqlWhereClause += ' and w.workOrderCloseDate is null';
        }
        else if (filters.workOrderOpenStatus === 'closed') {
            sqlWhereClause += ' and w.workOrderCloseDate is not null';
        }
    }
    if ((filters.workOrderOpenDateString ?? '') !== '') {
        sqlWhereClause += ' and w.workOrderOpenDate = ?';
        sqlParameters.push(dateStringToInteger(filters.workOrderOpenDateString));
    }
    const occupantNameFilters = getOccupantNameWhereClause(filters.occupantName, 'o');
    if (occupantNameFilters.sqlParameters.length > 0) {
        sqlWhereClause +=
            ` and w.workOrderId in (
        select workOrderId from WorkOrderContracts o
        where recordDelete_timeMillis is null
        and o.contractId in (
          select contractId from LotOccupancyOccupants o where recordDelete_timeMillis is null
          ${occupantNameFilters.sqlWhereClause}
        ))`;
        sqlParameters.push(...occupantNameFilters.sqlParameters);
    }
    const burialSiteNameFilters = getBurialSiteNameWhereClause(filters.burialSiteName, '', 'l');
    if (burialSiteNameFilters.sqlParameters.length > 0) {
        sqlWhereClause +=
            ` and w.workOrderId in (
        select workOrderId from WorkOrderBurialSites
        where recordDelete_timeMillis is null
        and burialSiteId in (
          select burialSiteId from BurialSites l
          where recordDelete_timeMillis is null
          ${burialSiteNameFilters.sqlWhereClause}
        ))`;
        sqlParameters.push(...burialSiteNameFilters.sqlParameters);
    }
    if ((filters.contractId ?? '') !== '') {
        sqlWhereClause +=
            ' and w.workOrderId in (select workOrderId from WorkOrderContracts where recordDelete_timeMillis is null and contractId = ?)';
        sqlParameters.push(filters.contractId);
    }
    return {
        sqlWhereClause,
        sqlParameters
    };
}
async function addInclusions(workOrder, options, database) {
    if (options.includeComments ?? false) {
        workOrder.workOrderComments = await getWorkOrderComments(workOrder.workOrderId, database);
    }
    if (options.includeBurialSites ?? false) {
        if (workOrder.workOrderBurialSiteCount === 0) {
            workOrder.workOrderBurialSites = [];
        }
        else {
            const workOrderBurialSitesResults = await getBurialSites({
                workOrderId: workOrder.workOrderId
            }, {
                limit: -1,
                offset: 0,
                includeContractCount: false
            }, database);
            workOrder.workOrderBurialSites = workOrderBurialSitesResults.burialSites;
        }
        const contracts = await getContracts({
            workOrderId: workOrder.workOrderId
        }, {
            limit: -1,
            offset: 0,
            includeInterments: true,
            includeFees: false,
            includeTransactions: false
        }, database);
        workOrder.workOrderContracts = contracts.contracts;
    }
    if (options.includeMilestones ?? false) {
        workOrder.workOrderMilestones =
            workOrder.workOrderMilestoneCount === 0
                ? []
                : await getWorkOrderMilestones({
                    workOrderId: workOrder.workOrderId
                }, {
                    orderBy: 'date'
                }, database);
    }
    return workOrder;
}
export async function getWorkOrders(filters, options, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    const { sqlWhereClause, sqlParameters } = buildWhereClause(filters);
    const count = database
        .prepare(`select count(*) as recordCount
        from WorkOrders w
        ${sqlWhereClause}`)
        .get(sqlParameters).recordCount;
    let workOrders = [];
    if (count > 0) {
        workOrders = database
            .prepare(`select w.workOrderId,
          w.workOrderTypeId, t.workOrderType,
          w.workOrderNumber, w.workOrderDescription,
          w.workOrderOpenDate, userFn_dateIntegerToString(w.workOrderOpenDate) as workOrderOpenDateString,
          w.workOrderCloseDate, userFn_dateIntegerToString(w.workOrderCloseDate) as workOrderCloseDateString,
          ifnull(m.workOrderMilestoneCount, 0) as workOrderMilestoneCount,
          ifnull(m.workOrderMilestoneCompletionCount, 0) as workOrderMilestoneCompletionCount,
          ifnull(l.workOrderLotCount, 0) as workOrderLotCount
          from WorkOrders w
          left join WorkOrderTypes t on w.workOrderTypeId = t.workOrderTypeId
          left join (
            select workOrderId,
            count(workOrderMilestoneId) as workOrderMilestoneCount,
            sum(case when workOrderMilestoneCompletionDate is null then 0 else 1 end) as workOrderMilestoneCompletionCount
            from WorkOrderMilestones
            where recordDelete_timeMillis is null
            group by workOrderId) m on w.workOrderId = m.workOrderId
          left join (
            select workOrderId, count(burialSiteId) as workOrderLotCount
            from WorkOrderLots
            where recordDelete_timeMillis is null
            group by workOrderId) l on w.workOrderId = l.workOrderId
          ${sqlWhereClause}
          order by w.workOrderOpenDate desc, w.workOrderNumber desc
          ${options.limit === -1
            ? ''
            : ` limit ${options.limit} offset ${options.offset}`}`)
            .all(sqlParameters);
    }
    const hasInclusions = (options.includeComments ?? false) ||
        (options.includeBurialSites ?? false) ||
        (options.includeMilestones ?? false);
    if (hasInclusions) {
        for (const workOrder of workOrders) {
            await addInclusions(workOrder, options, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.release();
    }
    return {
        count,
        workOrders
    };
}
export default getWorkOrders;

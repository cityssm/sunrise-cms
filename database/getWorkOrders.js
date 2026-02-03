import { dateIntegerToString, dateStringToInteger, dateToInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { sanitizeLimit, sanitizeOffset, sunriseDB } from '../helpers/database.helpers.js';
import { getBurialSiteNameWhereClause, getDeceasedNameWhereClause } from '../helpers/functions.sqlFilters.js';
import getBurialSites from './getBurialSites.js';
import getContracts from './getContracts.js';
import getWorkOrderComments from './getWorkOrderComments.js';
import getWorkOrderMilestones from './getWorkOrderMilestones.js';
export async function getWorkOrders(filters, options, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    const { sqlParameters, sqlWhereClause } = buildWhereClause(filters);
    const count = database
        .prepare(/* sql */ `select count(*) as recordCount
        from WorkOrders w
        ${sqlWhereClause}`)
        .pluck()
        .get(sqlParameters);
    let workOrders = [];
    if (count > 0) {
        const sqlLimitClause = options.limit === -1
            ? ''
            : ` limit ${sanitizeLimit(options.limit)} offset ${sanitizeOffset(options.offset)}`;
        const currentDateNumber = dateToInteger(new Date());
        workOrders = database
            .prepare(/* sql */ `select w.workOrderId,
          w.workOrderTypeId, t.workOrderType,
          w.workOrderNumber, w.workOrderDescription,
          w.workOrderOpenDate, userFn_dateIntegerToString(w.workOrderOpenDate) as workOrderOpenDateString,
          w.workOrderCloseDate, userFn_dateIntegerToString(w.workOrderCloseDate) as workOrderCloseDateString,
          ifnull(m.workOrderMilestoneCount, 0) as workOrderMilestoneCount,
          ifnull(m.workOrderMilestoneCompletionCount, 0) as workOrderMilestoneCompletionCount,
          ifnull(m.workOrderMilestoneOverdueCount, 0) as workOrderMilestoneOverdueCount,
          ifnull(l.workOrderBurialSiteCount, 0) as workOrderBurialSiteCount

          from WorkOrders w
          left join WorkOrderTypes t on w.workOrderTypeId = t.workOrderTypeId
          left join (
            select workOrderId,
            count(workOrderMilestoneId) as workOrderMilestoneCount,
            sum(case when workOrderMilestoneCompletionDate is null then 0 else 1 end) as workOrderMilestoneCompletionCount,
            sum(case when workOrderMilestoneDate < ${currentDateNumber} and workOrderMilestoneCompletionDate is null then 1 else 0 end) as workOrderMilestoneOverdueCount
            from WorkOrderMilestones
            where recordDelete_timeMillis is null
            group by workOrderId) m on w.workOrderId = m.workOrderId
          left join (
            select workOrderId, count(burialSiteId) as workOrderBurialSiteCount
            from WorkOrderBurialSites
            where recordDelete_timeMillis is null
            group by workOrderId) l on w.workOrderId = l.workOrderId
            
          ${sqlWhereClause}
          order by w.workOrderOpenDate desc, w.workOrderNumber desc
          ${sqlLimitClause}`)
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
        database.close();
    }
    return {
        count,
        workOrders
    };
}
async function addInclusions(workOrder, options, database) {
    if (options.includeComments ?? false) {
        workOrder.workOrderComments = getWorkOrderComments(workOrder.workOrderId, database);
    }
    if (options.includeBurialSites ?? false) {
        if (workOrder.workOrderBurialSiteCount === 0) {
            workOrder.workOrderBurialSites = [];
        }
        else {
            const workOrderBurialSitesResults = getBurialSites({
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
            includeFees: false,
            includeInterments: true,
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
    if ((filters.workOrderMilestoneDateString ?? '') !== '') {
        sqlWhereClause += ` and (w.workOrderId in (select workOrderId from WorkOrderMilestones where recordDelete_timeMillis is null and workOrderMilestoneDate = ?)
        or (w.workOrderOpenDate = ? and (select count(*) from WorkOrderMilestones m where m.recordDelete_timeMillis is null and m.workOrderId = w.workOrderId) = 0))`;
        sqlParameters.push(dateStringToInteger(filters.workOrderMilestoneDateString), dateStringToInteger(filters.workOrderMilestoneDateString));
    }
    /*
     * Funeral Home
     */
    if ((filters.funeralHomeId ?? '') !== '') {
        sqlWhereClause += ` and w.workOrderId in (
      select workOrderId from WorkOrderContracts wc
      left join Contracts c on wc.contractId = c.contractId
      where wc.recordDelete_timeMillis is null
      and c.funeralHomeId = ?)`;
        sqlParameters.push(filters.funeralHomeId);
    }
    /*
     * Deceased Name
     */
    const deceasedNameFilters = getDeceasedNameWhereClause(filters.deceasedName, 'ci');
    if (deceasedNameFilters.sqlParameters.length > 0) {
        sqlWhereClause += ` and w.workOrderId in (
        select workOrderId from WorkOrderContracts wc
        where wc.recordDelete_timeMillis is null
        and wc.contractId in (
          select contractId from ContractInterments ci where ci.recordDelete_timeMillis is null
          ${deceasedNameFilters.sqlWhereClause}
        ))`;
        sqlParameters.push(...deceasedNameFilters.sqlParameters);
    }
    /*
     * Burial Site Name
     */
    const burialSiteNameFilters = getBurialSiteNameWhereClause(filters.burialSiteName, '', 'l');
    if (burialSiteNameFilters.sqlParameters.length > 0) {
        sqlWhereClause += ` and (
      w.workOrderId in (
        select workOrderId from WorkOrderBurialSites
        where recordDelete_timeMillis is null
        and burialSiteId in (
          select burialSiteId from BurialSites l
          where recordDelete_timeMillis is null
          ${burialSiteNameFilters.sqlWhereClause}
        )
      ) or w.workOrderId in (
        select workOrderId from WorkOrderContracts wc
        left join Contracts c on wc.contractId = c.contractId
        where wc.recordDelete_timeMillis is null
        and c.burialSiteId in (
          select burialSiteId from BurialSites l
          where l.recordDelete_timeMillis is null
          ${burialSiteNameFilters.sqlWhereClause}
        )
      ))`;
        sqlParameters.push(...burialSiteNameFilters.sqlParameters, ...burialSiteNameFilters.sqlParameters);
    }
    /*
     * Cemetery
     */
    if ((filters.cemeteryId ?? '') !== '') {
        sqlWhereClause += ` and (
      w.workOrderId in (
        select workOrderId from WorkOrderBurialSites wb
        left join BurialSites b on wb.burialSiteId = b.burialSiteId
        left join Cemeteries cem on b.cemeteryId = cem.cemeteryId
        where wb.recordDelete_timeMillis is null
        and (cem.cemeteryId = ? or cem.parentCemeteryId = ?)
      ) or w.workOrderId in (
        select workOrderId from WorkOrderContracts wc
        left join Contracts c on wc.contractId = c.contractId
        left join BurialSites b on c.burialSiteId = b.burialSiteId
        left join Cemeteries cem on b.cemeteryId = cem.cemeteryId
        where wc.recordDelete_timeMillis is null
        and (cem.cemeteryId = ? or cem.parentCemeteryId = ?)
      ))`;
        sqlParameters.push(filters.cemeteryId, filters.cemeteryId, filters.cemeteryId, filters.cemeteryId);
    }
    /*
     * Contract
     */
    if ((filters.contractId ?? '') !== '') {
        sqlWhereClause +=
            ' and w.workOrderId in (select workOrderId from WorkOrderContracts where recordDelete_timeMillis is null and contractId = ?)';
        sqlParameters.push(filters.contractId);
    }
    return {
        sqlParameters,
        sqlWhereClause
    };
}
export default getWorkOrders;

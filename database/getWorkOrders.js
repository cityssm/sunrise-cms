"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkOrders = getWorkOrders;
const utils_datetime_1 = require("@cityssm/utils-datetime");
const better_sqlite3_1 = require("better-sqlite3");
const database_helpers_js_1 = require("../helpers/database.helpers.js");
const functions_sqlFilters_js_1 = require("../helpers/functions.sqlFilters.js");
const getBurialSites_js_1 = require("./getBurialSites.js");
const getContracts_js_1 = require("./getContracts.js");
const getWorkOrderComments_js_1 = require("./getWorkOrderComments.js");
const getWorkOrderMilestones_js_1 = require("./getWorkOrderMilestones.js");
async function getWorkOrders(filters, options, connectedDatabase) {
    var _a, _b, _c;
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB);
    database.function('userFn_dateIntegerToString', utils_datetime_1.dateIntegerToString);
    const { sqlParameters, sqlWhereClause } = buildWhereClause(filters);
    const count = database
        .prepare(`select count(*) as recordCount
        from WorkOrders w
        ${sqlWhereClause}`)
        .pluck()
        .get(sqlParameters);
    let workOrders = [];
    if (count > 0) {
        const sqlLimitClause = options.limit === -1
            ? ''
            : ` limit ${(0, database_helpers_js_1.sanitizeLimit)(options.limit)} offset ${(0, database_helpers_js_1.sanitizeOffset)(options.offset)}`;
        const currentDateNumber = (0, utils_datetime_1.dateToInteger)(new Date());
        workOrders = database
            .prepare(`select w.workOrderId,
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
    const hasInclusions = ((_a = options.includeComments) !== null && _a !== void 0 ? _a : false) ||
        ((_b = options.includeBurialSites) !== null && _b !== void 0 ? _b : false) ||
        ((_c = options.includeMilestones) !== null && _c !== void 0 ? _c : false);
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
    var _a, _b, _c;
    if ((_a = options.includeComments) !== null && _a !== void 0 ? _a : false) {
        workOrder.workOrderComments = (0, getWorkOrderComments_js_1.default)(workOrder.workOrderId, database);
    }
    if ((_b = options.includeBurialSites) !== null && _b !== void 0 ? _b : false) {
        if (workOrder.workOrderBurialSiteCount === 0) {
            workOrder.workOrderBurialSites = [];
        }
        else {
            const workOrderBurialSitesResults = (0, getBurialSites_js_1.default)({
                workOrderId: workOrder.workOrderId
            }, {
                limit: -1,
                offset: 0,
                includeContractCount: false
            }, database);
            workOrder.workOrderBurialSites = workOrderBurialSitesResults.burialSites;
        }
        const contracts = await (0, getContracts_js_1.default)({
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
    if ((_c = options.includeMilestones) !== null && _c !== void 0 ? _c : false) {
        workOrder.workOrderMilestones =
            workOrder.workOrderMilestoneCount === 0
                ? []
                : await (0, getWorkOrderMilestones_js_1.default)({
                    workOrderId: workOrder.workOrderId
                }, {
                    orderBy: 'date'
                }, database);
    }
    return workOrder;
}
function buildWhereClause(filters) {
    var _a, _b, _c, _d, _e;
    let sqlWhereClause = ' where w.recordDelete_timeMillis is null';
    const sqlParameters = [];
    if (((_a = filters.workOrderTypeId) !== null && _a !== void 0 ? _a : '') !== '') {
        sqlWhereClause += ' and w.workOrderTypeId = ?';
        sqlParameters.push(filters.workOrderTypeId);
    }
    if (((_b = filters.workOrderOpenStatus) !== null && _b !== void 0 ? _b : '') !== '') {
        if (filters.workOrderOpenStatus === 'open') {
            sqlWhereClause += ' and w.workOrderCloseDate is null';
        }
        else if (filters.workOrderOpenStatus === 'closed') {
            sqlWhereClause += ' and w.workOrderCloseDate is not null';
        }
    }
    if (((_c = filters.workOrderOpenDateString) !== null && _c !== void 0 ? _c : '') !== '') {
        sqlWhereClause += ' and w.workOrderOpenDate = ?';
        sqlParameters.push((0, utils_datetime_1.dateStringToInteger)(filters.workOrderOpenDateString));
    }
    if (((_d = filters.workOrderMilestoneDateString) !== null && _d !== void 0 ? _d : '') !== '') {
        sqlWhereClause +=
            ` and (w.workOrderId in (select workOrderId from WorkOrderMilestones where recordDelete_timeMillis is null and workOrderMilestoneDate = ?)
        or (w.workOrderOpenDate = ? and (select count(*) from WorkOrderMilestones m where m.recordDelete_timeMillis is null and m.workOrderId = w.workOrderId) = 0))`;
        sqlParameters.push((0, utils_datetime_1.dateStringToInteger)(filters.workOrderMilestoneDateString), (0, utils_datetime_1.dateStringToInteger)(filters.workOrderMilestoneDateString));
    }
    const deceasedNameFilters = (0, functions_sqlFilters_js_1.getDeceasedNameWhereClause)(filters.deceasedName, 'o');
    if (deceasedNameFilters.sqlParameters.length > 0) {
        sqlWhereClause += ` and w.workOrderId in (
        select workOrderId from WorkOrderContracts o
        where recordDelete_timeMillis is null
        and o.contractId in (
          select contractId from ContractInterments o where recordDelete_timeMillis is null
          ${deceasedNameFilters.sqlWhereClause}
        ))`;
        sqlParameters.push(...deceasedNameFilters.sqlParameters);
    }
    const burialSiteNameFilters = (0, functions_sqlFilters_js_1.getBurialSiteNameWhereClause)(filters.burialSiteName, '', 'l');
    if (burialSiteNameFilters.sqlParameters.length > 0) {
        sqlWhereClause += ` and w.workOrderId in (
        select workOrderId from WorkOrderBurialSites
        where recordDelete_timeMillis is null
        and burialSiteId in (
          select burialSiteId from BurialSites l
          where recordDelete_timeMillis is null
          ${burialSiteNameFilters.sqlWhereClause}
        ))`;
        sqlParameters.push(...burialSiteNameFilters.sqlParameters);
    }
    if (((_e = filters.contractId) !== null && _e !== void 0 ? _e : '') !== '') {
        sqlWhereClause +=
            ' and w.workOrderId in (select workOrderId from WorkOrderContracts where recordDelete_timeMillis is null and contractId = ?)';
        sqlParameters.push(filters.contractId);
    }
    return {
        sqlParameters,
        sqlWhereClause
    };
}
exports.default = getWorkOrders;

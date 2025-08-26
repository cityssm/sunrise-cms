"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getWorkOrderMilestones;
const utils_datetime_1 = require("@cityssm/utils-datetime");
const better_sqlite3_1 = require("better-sqlite3");
const config_helpers_js_1 = require("../helpers/config.helpers.js");
const database_helpers_js_1 = require("../helpers/database.helpers.js");
const getBurialSites_js_1 = require("./getBurialSites.js");
const getContracts_js_1 = require("./getContracts.js");
// eslint-disable-next-line security/detect-unsafe-regex
const commaSeparatedNumbersRegex = /^\d+(?:,\d+)*$/;
async function getWorkOrderMilestones(filters, options, connectedDatabase) {
    var _a, _b;
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB);
    database.function('userFn_dateIntegerToString', utils_datetime_1.dateIntegerToString);
    database.function('userFn_timeIntegerToString', utils_datetime_1.timeIntegerToString);
    database.function('userFn_timeIntegerToPeriodString', utils_datetime_1.timeIntegerToPeriodString);
    // Filters
    const { sqlParameters, sqlWhereClause } = buildWhereClause(filters);
    // Order By
    let orderByClause = '';
    switch (options.orderBy) {
        case 'completion': {
            orderByClause = ` order by
        m.workOrderMilestoneCompletionDate, m.workOrderMilestoneCompletionTime,
        m.workOrderMilestoneDate,
        ifnull(m.workOrderMilestoneTime, 9999),
        t.orderNumber, m.workOrderMilestoneId`;
            break;
        }
        case 'date': {
            orderByClause = ` order by m.workOrderMilestoneDate,
        ifnull(m.workOrderMilestoneTime, 9999),
        t.orderNumber, m.workOrderId, m.workOrderMilestoneId`;
            break;
        }
    }
    // Query
    // eslint-disable-next-line no-secrets/no-secrets
    const sql = `select m.workOrderMilestoneId,
    m.workOrderMilestoneTypeId, t.workOrderMilestoneType,
    m.workOrderMilestoneDate,
    userFn_dateIntegerToString(m.workOrderMilestoneDate) as workOrderMilestoneDateString,
    m.workOrderMilestoneTime,
    userFn_timeIntegerToString(m.workOrderMilestoneTime) as workOrderMilestoneTimeString,
    userFn_timeIntegerToPeriodString(ifnull(m.workOrderMilestoneTime, 0)) as workOrderMilestoneTimePeriodString,
    m.workOrderMilestoneDescription,
    m.workOrderMilestoneCompletionDate,
    userFn_dateIntegerToString(m.workOrderMilestoneCompletionDate) as workOrderMilestoneCompletionDateString,
    m.workOrderMilestoneCompletionTime,
    userFn_timeIntegerToString(m.workOrderMilestoneCompletionTime) as workOrderMilestoneCompletionTimeString,
    userFn_timeIntegerToPeriodString(ifnull(m.workOrderMilestoneCompletionTime, 0)) as workOrderMilestoneCompletionTimePeriodString,
    ${((_a = options.includeWorkOrders) !== null && _a !== void 0 ? _a : false)
        ? ` m.workOrderId, w.workOrderNumber, wt.workOrderType, w.workOrderDescription,
            w.workOrderOpenDate, userFn_dateIntegerToString(w.workOrderOpenDate) as workOrderOpenDateString,
            w.workOrderCloseDate, userFn_dateIntegerToString(w.workOrderCloseDate) as workOrderCloseDateString,
            w.recordUpdate_timeMillis as workOrderRecordUpdate_timeMillis,`
        : ''}
    m.recordCreate_userName, m.recordCreate_timeMillis,
    m.recordUpdate_userName, m.recordUpdate_timeMillis

    from WorkOrderMilestones m
    left join WorkOrderMilestoneTypes t on m.workOrderMilestoneTypeId = t.workOrderMilestoneTypeId
    left join WorkOrders w on m.workOrderId = w.workOrderId
    left join WorkOrderTypes wt on w.workOrderTypeId = wt.workOrderTypeId
    
    ${sqlWhereClause}
    ${orderByClause}`;
    const workOrderMilestones = database
        .prepare(sql)
        .all(sqlParameters);
    if ((_b = options.includeWorkOrders) !== null && _b !== void 0 ? _b : false) {
        for (const workOrderMilestone of workOrderMilestones) {
            const burialSites = (0, getBurialSites_js_1.default)({
                workOrderId: workOrderMilestone.workOrderId
            }, {
                limit: -1,
                offset: 0,
                includeContractCount: false
            }, database);
            workOrderMilestone.workOrderBurialSites = burialSites.burialSites;
            const contracts = await (0, getContracts_js_1.default)({
                workOrderId: workOrderMilestone.workOrderId
            }, {
                limit: -1,
                offset: 0,
                includeFees: false,
                includeInterments: true,
                includeTransactions: false
            }, database);
            workOrderMilestone.workOrderContracts = contracts.contracts;
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return workOrderMilestones;
}
function buildWhereClause(filters) {
    var _a, _b, _c;
    let sqlWhereClause = ' where m.recordDelete_timeMillis is null and w.recordDelete_timeMillis is null';
    const sqlParameters = [];
    if (((_a = filters.workOrderId) !== null && _a !== void 0 ? _a : '') !== '') {
        sqlWhereClause += ' and m.workOrderId = ?';
        sqlParameters.push(filters.workOrderId);
    }
    const date = new Date();
    const currentDateNumber = (0, utils_datetime_1.dateToInteger)(date);
    date.setDate(date.getDate() -
        (0, config_helpers_js_1.getConfigProperty)('settings.workOrders.workOrderMilestoneDateRecentBeforeDays'));
    const recentBeforeDateNumber = (0, utils_datetime_1.dateToInteger)(date);
    date.setDate(date.getDate() +
        (0, config_helpers_js_1.getConfigProperty)('settings.workOrders.workOrderMilestoneDateRecentBeforeDays') +
        (0, config_helpers_js_1.getConfigProperty)('settings.workOrders.workOrderMilestoneDateRecentAfterDays'));
    const recentAfterDateNumber = (0, utils_datetime_1.dateToInteger)(date);
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (filters.workOrderMilestoneDateFilter) {
        case 'blank': {
            sqlWhereClause += ' and m.workOrderMilestoneDate = 0';
            break;
        }
        case 'notBlank': {
            sqlWhereClause += ' and m.workOrderMilestoneDate > 0';
            break;
        }
        case 'recent': {
            sqlWhereClause +=
                ' and m.workOrderMilestoneDate >= ? and m.workOrderMilestoneDate <= ?';
            sqlParameters.push(recentBeforeDateNumber, recentAfterDateNumber);
            break;
        }
        case 'upcomingMissed': {
            sqlWhereClause +=
                ' and (m.workOrderMilestoneCompletionDate is null or m.workOrderMilestoneDate >= ?)';
            sqlParameters.push(currentDateNumber);
            break;
        }
        case 'yearMonth': {
            const yearNumber = typeof filters.workOrderMilestoneYear === 'string'
                ? Number.parseInt(filters.workOrderMilestoneYear)
                : (_b = filters.workOrderMilestoneYear) !== null && _b !== void 0 ? _b : new Date().getFullYear();
            const monthNumber = typeof filters.workOrderMilestoneMonth === 'string'
                ? Number.parseInt(filters.workOrderMilestoneMonth)
                : (_c = filters.workOrderMilestoneMonth) !== null && _c !== void 0 ? _c : new Date().getMonth() + 1;
            const yearMonth = yearNumber * 10000 + monthNumber * 100;
            sqlWhereClause += ' and m.workOrderMilestoneDate between ? and ?';
            sqlParameters.push(yearMonth, yearMonth + 100);
            break;
        }
    }
    if (filters.workOrderMilestoneDateString !== undefined &&
        filters.workOrderMilestoneDateString !== '') {
        sqlWhereClause += ' and m.workOrderMilestoneDate = ?';
        sqlParameters.push((0, utils_datetime_1.dateStringToInteger)(filters.workOrderMilestoneDateString));
    }
    if (filters.workOrderTypeIds !== undefined &&
        filters.workOrderTypeIds !== '' &&
        commaSeparatedNumbersRegex.test(filters.workOrderTypeIds)) {
        sqlWhereClause += ` and w.workOrderTypeId in (${filters.workOrderTypeIds})`;
    }
    if (filters.workOrderMilestoneTypeIds !== undefined &&
        filters.workOrderMilestoneTypeIds !== '' &&
        commaSeparatedNumbersRegex.test(filters.workOrderMilestoneTypeIds)) {
        sqlWhereClause += ` and m.workOrderMilestoneTypeId in (${filters.workOrderMilestoneTypeIds})`;
    }
    return {
        sqlParameters,
        sqlWhereClause
    };
}

import { dateIntegerToString, dateStringToInteger, dateToInteger, timeIntegerToPeriodString, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import getBurialSites from './getBurialSites.js';
import getContracts from './getContracts.js';
// eslint-disable-next-line security/detect-unsafe-regex
const commaSeparatedNumbersRegex = /^\d+(?:,\d+)*$/;
export default async function getWorkOrderMilestones(filters, options, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    database.function('userFn_timeIntegerToString', timeIntegerToString);
    database.function('userFn_timeIntegerToPeriodString', timeIntegerToPeriodString);
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
    ${options.includeWorkOrders ?? false
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
    if (options.includeWorkOrders ?? false) {
        for (const workOrderMilestone of workOrderMilestones) {
            const burialSites = getBurialSites({
                workOrderId: workOrderMilestone.workOrderId
            }, {
                limit: -1,
                offset: 0,
                includeContractCount: false
            }, database);
            workOrderMilestone.workOrderBurialSites = burialSites.burialSites;
            const contracts = await getContracts({
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
    let sqlWhereClause = ' where m.recordDelete_timeMillis is null and w.recordDelete_timeMillis is null';
    const sqlParameters = [];
    if ((filters.workOrderId ?? '') !== '') {
        sqlWhereClause += ' and m.workOrderId = ?';
        sqlParameters.push(filters.workOrderId);
    }
    const date = new Date();
    const currentDateNumber = dateToInteger(date);
    date.setDate(date.getDate() -
        getConfigProperty('settings.workOrders.workOrderMilestoneDateRecentBeforeDays'));
    const recentBeforeDateNumber = dateToInteger(date);
    date.setDate(date.getDate() +
        getConfigProperty('settings.workOrders.workOrderMilestoneDateRecentBeforeDays') +
        getConfigProperty('settings.workOrders.workOrderMilestoneDateRecentAfterDays'));
    const recentAfterDateNumber = dateToInteger(date);
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
                : filters.workOrderMilestoneYear ?? new Date().getFullYear();
            const monthNumber = typeof filters.workOrderMilestoneMonth === 'string'
                ? Number.parseInt(filters.workOrderMilestoneMonth)
                : filters.workOrderMilestoneMonth ?? new Date().getMonth() + 1;
            const yearMonth = yearNumber * 10_000 + monthNumber * 100;
            sqlWhereClause += ' and m.workOrderMilestoneDate between ? and ?';
            sqlParameters.push(yearMonth, yearMonth + 100);
            break;
        }
    }
    if (filters.workOrderMilestoneDateString !== undefined &&
        filters.workOrderMilestoneDateString !== '') {
        sqlWhereClause += ' and m.workOrderMilestoneDate = ?';
        sqlParameters.push(dateStringToInteger(filters.workOrderMilestoneDateString));
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

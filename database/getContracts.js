import { dateIntegerToString, dateStringToInteger, timeIntegerToPeriodString, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import { getContractTypeById } from '../helpers/functions.cache.js';
import { getBurialSiteNameWhereClause, getContractTimeWhereClause, getDeceasedNameWhereClause } from '../helpers/functions.sqlFilters.js';
import getContractFees from './getContractFees.js';
import getContractInterments from './getContractInterments.js';
import getContractTransactions from './getContractTransactions.js';
export default async function getContracts(filters, options, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    database.function('userFn_timeIntegerToString', timeIntegerToString);
    database.function('userFn_timeIntegerToPeriodString', timeIntegerToPeriodString);
    const { sqlParameters, sqlWhereClause } = buildWhereClause(filters);
    let count = typeof options.limit === 'string'
        ? Number.parseInt(options.limit, 10)
        : options.limit;
    const isLimited = options.limit !== -1;
    if (isLimited) {
        count = database
            .prepare(`select count(*) as recordCount
            from Contracts o
            left join BurialSites l on o.burialSiteId = l.burialSiteId
            left join Cemeteries m on l.cemeteryId = m.cemeteryId
            ${sqlWhereClause}`)
            .get(sqlParameters).recordCount;
    }
    let contracts = [];
    if (count !== 0) {
        contracts = database
            .prepare(`select o.contractId,
          o.contractTypeId, t.contractType, t.isPreneed,
          o.burialSiteId, lt.burialSiteType, l.burialSiteName,
          case when l.recordDelete_timeMillis is null then 1 else 0 end as burialSiteIsActive,
          l.cemeteryId, m.cemeteryName,
          o.contractStartDate, userFn_dateIntegerToString(o.contractStartDate) as contractStartDateString,
          o.contractEndDate, userFn_dateIntegerToString(o.contractEndDate) as contractEndDateString,
          o.purchaserName, o.purchaserAddress1, o.purchaserAddress2,
          o.purchaserCity, o.purchaserProvince, o.purchaserPostalCode,
          o.purchaserPhoneNumber, o.purchaserEmail, o.purchaserRelationship,
          o.funeralHomeId, o.funeralDirectorName, f.funeralHomeName,

          o.funeralDate, userFn_dateIntegerToString(o.funeralDate) as funeralDateString,
          o.funeralTime,
          userFn_timeIntegerToString(o.funeralTime) as funeralTimeString,
          userFn_timeIntegerToPeriodString(o.funeralTime) as funeralTimePeriodString,
          o.directionOfArrival,
          o.committalTypeId, c.committalType
          from Contracts o
          left join ContractTypes t on o.contractTypeId = t.contractTypeId
          left join CommittalTypes c on o.committalTypeId = c.committalTypeId
          left join BurialSites l on o.burialSiteId = l.burialSiteId
          left join BurialSiteTypes lt on l.burialSiteTypeId = lt.burialSiteTypeId
          left join Cemeteries m on l.cemeteryId = m.cemeteryId
          left join FuneralHomes f on o.funeralHomeId = f.funeralHomeId
          ${sqlWhereClause}
          order by o.contractStartDate desc, ifnull(o.contractEndDate, 99999999) desc,
            l.burialSiteNameSegment1,
            l.burialSiteNameSegment2,
            l.burialSiteNameSegment3,
            l.burialSiteNameSegment4,
            l.burialSiteNameSegment5,
            o.burialSiteId, o.contractId desc
          ${isLimited ? ` limit ${options.limit} offset ${options.offset}` : ''}`)
            .all(sqlParameters);
        if (!isLimited) {
            count = contracts.length;
        }
        for (const contract of contracts) {
            const contractType = getContractTypeById(contract.contractTypeId);
            if (contractType !== undefined) {
                contract.printEJS = (contractType.contractTypePrints ?? []).includes('*')
                    ? getConfigProperty('settings.contracts.prints')[0]
                    : (contractType.contractTypePrints ?? [])[0];
            }
            await addInclusions(contract, options, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return {
        contracts,
        count
    };
}
async function addInclusions(contract, options, database) {
    if (options.includeFees) {
        contract.contractFees = getContractFees(contract.contractId, database);
    }
    if (options.includeTransactions) {
        contract.contractTransactions = await getContractTransactions(contract.contractId, { includeIntegrations: false }, database);
    }
    if (options.includeInterments) {
        contract.contractInterments = getContractInterments(contract.contractId, database);
    }
    return contract;
}
// eslint-disable-next-line complexity
function buildWhereClause(filters) {
    let sqlWhereClause = ' where o.recordDelete_timeMillis is null';
    const sqlParameters = [];
    if ((filters.burialSiteId ?? '') !== '') {
        sqlWhereClause += ' and o.burialSiteId = ?';
        sqlParameters.push(filters.burialSiteId);
    }
    const burialSiteNameFilters = getBurialSiteNameWhereClause(filters.burialSiteName, filters.burialSiteNameSearchType ?? '', 'l');
    sqlWhereClause += burialSiteNameFilters.sqlWhereClause;
    sqlParameters.push(...burialSiteNameFilters.sqlParameters);
    const deceasedNameFilters = getDeceasedNameWhereClause(filters.deceasedName, 'o');
    if (deceasedNameFilters.sqlParameters.length > 0) {
        sqlWhereClause += ` and o.contractId in (
        select contractId from ContractInterments o
        where recordDelete_timeMillis is null
        ${deceasedNameFilters.sqlWhereClause})`;
        sqlParameters.push(...deceasedNameFilters.sqlParameters);
    }
    if ((filters.contractTypeId ?? '') !== '') {
        sqlWhereClause += ' and o.contractTypeId = ?';
        sqlParameters.push(filters.contractTypeId);
    }
    const contractTimeFilters = getContractTimeWhereClause(filters.contractTime ?? '', 'o');
    sqlWhereClause += contractTimeFilters.sqlWhereClause;
    sqlParameters.push(...contractTimeFilters.sqlParameters);
    if ((filters.contractStartDateString ?? '') !== '') {
        sqlWhereClause += ' and o.contractStartDate = ?';
        sqlParameters.push(dateStringToInteger(filters.contractStartDateString));
    }
    if ((filters.contractEffectiveDateString ?? '') !== '') {
        sqlWhereClause += ` and (
        o.contractEndDate is null
        or (o.contractStartDate <= ? and o.contractEndDate >= ?)
      )`;
        sqlParameters.push(dateStringToInteger(filters.contractEffectiveDateString), dateStringToInteger(filters.contractEffectiveDateString));
    }
    if ((filters.cemeteryId ?? '') !== '') {
        sqlWhereClause += ' and (m.cemeteryId = ? or m.parentCemeteryId = ?)';
        sqlParameters.push(filters.cemeteryId, filters.cemeteryId);
    }
    if ((filters.burialSiteTypeId ?? '') !== '') {
        sqlWhereClause += ' and l.burialSiteTypeId = ?';
        sqlParameters.push(filters.burialSiteTypeId);
    }
    if ((filters.funeralHomeId ?? '') !== '') {
        sqlWhereClause += ' and o.funeralHomeId = ?';
        sqlParameters.push(filters.funeralHomeId);
    }
    if ((filters.workOrderId ?? '') !== '') {
        sqlWhereClause +=
            ' and o.contractId in (select contractId from WorkOrderContracts where recordDelete_timeMillis is null and workOrderId = ?)';
        sqlParameters.push(filters.workOrderId);
    }
    if ((filters.notWorkOrderId ?? '') !== '') {
        sqlWhereClause +=
            ' and o.contractId not in (select contractId from WorkOrderContracts where recordDelete_timeMillis is null and workOrderId = ?)';
        sqlParameters.push(filters.notWorkOrderId);
    }
    return {
        sqlParameters,
        sqlWhereClause
    };
}

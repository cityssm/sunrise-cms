import { dateIntegerToString, dateStringToInteger, dateToInteger, timeIntegerToPeriodString, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sanitizeLimit, sanitizeOffset, sunriseDB } from '../helpers/database.helpers.js';
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
          from Contracts c
          left join BurialSites l on c.burialSiteId = l.burialSiteId
          left join Cemeteries m on l.cemeteryId = m.cemeteryId
          ${sqlWhereClause}`)
            .pluck()
            .get(sqlParameters);
    }
    let contracts = [];
    if (count !== 0) {
        const sqlLimitClause = isLimited
            ? ` limit ${sanitizeLimit(options.limit)}
          offset ${sanitizeOffset(options.offset)}`
            : '';
        contracts = database
            .prepare(`select c.contractId,
            c.contractTypeId, t.contractType, t.isPreneed,
            c.burialSiteId, lt.burialSiteType, l.burialSiteName,
            case when l.recordDelete_timeMillis is null then 1 else 0 end as burialSiteIsActive,
            l.cemeteryId, m.cemeteryName,

            c.contractStartDate, userFn_dateIntegerToString(c.contractStartDate) as contractStartDateString,
            c.contractEndDate, userFn_dateIntegerToString(c.contractEndDate) as contractEndDateString,

            (c.contractEndDate is null or c.contractEndDate > cast(strftime('%Y%m%d', date()) as integer)) as contractIsActive,
            (c.contractStartDate > cast(strftime('%Y%m%d', date()) as integer)) as contractIsFuture,

            c.purchaserName, c.purchaserAddress1, c.purchaserAddress2,
            c.purchaserCity, c.purchaserProvince, c.purchaserPostalCode,
            c.purchaserPhoneNumber, c.purchaserEmail, c.purchaserRelationship,
            c.funeralHomeId, c.funeralDirectorName, f.funeralHomeName,

            c.funeralDate, userFn_dateIntegerToString(c.funeralDate) as funeralDateString,
            
            c.funeralTime,
            userFn_timeIntegerToString(c.funeralTime) as funeralTimeString,
            userFn_timeIntegerToPeriodString(c.funeralTime) as funeralTimePeriodString,

            c.directionOfArrival,
            c.committalTypeId, cm.committalType
            
          from Contracts c
          left join ContractTypes t on c.contractTypeId = t.contractTypeId
          left join CommittalTypes cm on c.committalTypeId = cm.committalTypeId
          left join BurialSites l on c.burialSiteId = l.burialSiteId
          left join BurialSiteTypes lt on l.burialSiteTypeId = lt.burialSiteTypeId
          left join Cemeteries m on l.cemeteryId = m.cemeteryId
          left join FuneralHomes f on c.funeralHomeId = f.funeralHomeId
          ${sqlWhereClause}
          ${options.orderBy !== undefined && options.orderBy !== ''
            ? ` order by ${options.orderBy}`
            : ` order by c.contractStartDate desc, ifnull(c.contractEndDate, 99999999) desc,
                  l.burialSiteNameSegment1,
                  l.burialSiteNameSegment2,
                  l.burialSiteNameSegment3,
                  l.burialSiteNameSegment4,
                  l.burialSiteNameSegment5,
                  c.burialSiteId, c.contractId desc`}
          ${sqlLimitClause}`)
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
    let sqlWhereClause = ' where c.recordDelete_timeMillis is null';
    const sqlParameters = [];
    if ((filters.burialSiteId ?? '') !== '') {
        sqlWhereClause += ' and c.burialSiteId = ?';
        sqlParameters.push(filters.burialSiteId);
    }
    const burialSiteNameFilters = getBurialSiteNameWhereClause(filters.burialSiteName, filters.burialSiteNameSearchType ?? '', 'l');
    sqlWhereClause += burialSiteNameFilters.sqlWhereClause;
    sqlParameters.push(...burialSiteNameFilters.sqlParameters);
    const deceasedNameFilters = getDeceasedNameWhereClause(filters.deceasedName, 'c');
    if (deceasedNameFilters.sqlParameters.length > 0) {
        sqlWhereClause += ` and c.contractId in (
        select contractId from ContractInterments c
        where recordDelete_timeMillis is null
        ${deceasedNameFilters.sqlWhereClause})`;
        sqlParameters.push(...deceasedNameFilters.sqlParameters);
    }
    if ((filters.contractTypeId ?? '') !== '') {
        sqlWhereClause += ' and c.contractTypeId = ?';
        sqlParameters.push(filters.contractTypeId);
    }
    const contractTimeFilters = getContractTimeWhereClause(filters.contractTime ?? '', 'c');
    sqlWhereClause += contractTimeFilters.sqlWhereClause;
    sqlParameters.push(...contractTimeFilters.sqlParameters);
    if ((filters.contractStartDateString ?? '') !== '') {
        sqlWhereClause += ' and c.contractStartDate = ?';
        sqlParameters.push(dateStringToInteger(filters.contractStartDateString));
    }
    if ((filters.contractEffectiveDateString ?? '') !== '') {
        sqlWhereClause += ` and (
        c.contractEndDate is null
        or (c.contractStartDate <= ? and c.contractEndDate >= ?)
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
        sqlWhereClause += ' and c.funeralHomeId = ?';
        sqlParameters.push(filters.funeralHomeId);
    }
    if ((filters.funeralTime ?? '') === 'upcoming') {
        sqlWhereClause += ' and c.funeralDate >= ?';
        sqlParameters.push(dateToInteger(new Date()));
    }
    if ((filters.workOrderId ?? '') !== '') {
        sqlWhereClause +=
            ' and c.contractId in (select contractId from WorkOrderContracts where recordDelete_timeMillis is null and workOrderId = ?)';
        sqlParameters.push(filters.workOrderId);
    }
    if ((filters.notWorkOrderId ?? '') !== '') {
        sqlWhereClause +=
            ' and c.contractId not in (select contractId from WorkOrderContracts where recordDelete_timeMillis is null and workOrderId = ?)';
        sqlParameters.push(filters.notWorkOrderId);
    }
    if ((filters.notContractId ?? '') !== '') {
        sqlWhereClause += ' and c.contractId <> ?';
        sqlParameters.push(filters.notContractId);
    }
    if ((filters.relatedContractId ?? '') !== '') {
        sqlWhereClause += ` and (
        c.contractId in (select contractIdA from RelatedContracts where contractIdB = ?)
        or c.contractId in (select contractIdB from RelatedContracts where contractIdA = ?)
      )`;
        sqlParameters.push(filters.relatedContractId, filters.relatedContractId);
    }
    if ((filters.notRelatedContractId ?? '') !== '') {
        sqlWhereClause += ` and c.contractId not in (select contractIdA from RelatedContracts where contractIdB = ?)
      and c.contractId not in (select contractIdB from RelatedContracts where contractIdA = ?)`;
        sqlParameters.push(filters.notRelatedContractId, filters.notRelatedContractId);
    }
    return {
        sqlParameters,
        sqlWhereClause
    };
}

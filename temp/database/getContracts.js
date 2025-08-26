import { dateIntegerToString, dateStringToInteger, dateToInteger, timeIntegerToPeriodString, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getCachedContractTypeById } from '../helpers/cache/contractTypes.cache.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sanitizeLimit, sanitizeOffset, sunriseDB } from '../helpers/database.helpers.js';
import { getBurialSiteNameWhereClause, getContractTimeWhereClause, getDeceasedNameWhereClause } from '../helpers/functions.sqlFilters.js';
import getContractFees from './getContractFees.js';
import getContractInterments from './getContractInterments.js';
import getContractTransactions from './getContractTransactions.js';
const validOrderByStrings = [
    'c.funeralDate, c.funeralTime, c.contractId'
];
export default async function getContracts(filters, options, connectedDatabase) {
    var _a, _b;
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : sqlite(sunriseDB);
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
          left join BurialSites b on c.burialSiteId = b.burialSiteId
          left join Cemeteries cem on b.cemeteryId = cem.cemeteryId
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
            c.burialSiteId, lt.burialSiteType, b.burialSiteName,
            case when b.recordDelete_timeMillis is null then 1 else 0 end as burialSiteIsActive,
            b.cemeteryId, cem.cemeteryName,

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
          left join BurialSites b on c.burialSiteId = b.burialSiteId
          left join BurialSiteTypes lt on b.burialSiteTypeId = lt.burialSiteTypeId
          left join Cemeteries cem on b.cemeteryId = cem.cemeteryId
          left join FuneralHomes f on c.funeralHomeId = f.funeralHomeId
          ${sqlWhereClause}
          ${options.orderBy !== undefined &&
            validOrderByStrings.includes(options.orderBy)
            ? ` order by ${options.orderBy}`
            : ` order by c.contractStartDate desc, ifnull(c.contractEndDate, 99999999) desc,
                  b.burialSiteNameSegment1,
                  b.burialSiteNameSegment2,
                  b.burialSiteNameSegment3,
                  b.burialSiteNameSegment4,
                  b.burialSiteNameSegment5,
                  c.burialSiteId, c.contractId desc`}
          ${sqlLimitClause}`)
            .all(sqlParameters);
        if (!isLimited) {
            count = contracts.length;
        }
        for (const contract of contracts) {
            const contractType = getCachedContractTypeById(contract.contractTypeId);
            if (contractType !== undefined) {
                contract.printEJS = ((_a = contractType.contractTypePrints) !== null && _a !== void 0 ? _a : []).includes('*')
                    ? getConfigProperty('settings.contracts.prints')[0]
                    : ((_b = contractType.contractTypePrints) !== null && _b !== void 0 ? _b : [])[0];
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    let sqlWhereClause = ' where c.recordDelete_timeMillis is null';
    const sqlParameters = [];
    if (((_a = filters.burialSiteId) !== null && _a !== void 0 ? _a : '') !== '') {
        sqlWhereClause += ' and c.burialSiteId = ?';
        sqlParameters.push(filters.burialSiteId);
    }
    const burialSiteNameFilters = getBurialSiteNameWhereClause(filters.burialSiteName, (_b = filters.burialSiteNameSearchType) !== null && _b !== void 0 ? _b : '', 'l');
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
    if (((_c = filters.contractTypeId) !== null && _c !== void 0 ? _c : '') !== '') {
        sqlWhereClause += ' and c.contractTypeId = ?';
        sqlParameters.push(filters.contractTypeId);
    }
    const contractTimeFilters = getContractTimeWhereClause((_d = filters.contractTime) !== null && _d !== void 0 ? _d : '', 'c');
    sqlWhereClause += contractTimeFilters.sqlWhereClause;
    sqlParameters.push(...contractTimeFilters.sqlParameters);
    if (((_e = filters.contractStartDateString) !== null && _e !== void 0 ? _e : '') !== '') {
        sqlWhereClause += ' and c.contractStartDate = ?';
        sqlParameters.push(dateStringToInteger(filters.contractStartDateString));
    }
    if (((_f = filters.contractEffectiveDateString) !== null && _f !== void 0 ? _f : '') !== '') {
        sqlWhereClause += ` and (
        c.contractEndDate is null
        or (c.contractStartDate <= ? and c.contractEndDate >= ?)
      )`;
        sqlParameters.push(dateStringToInteger(filters.contractEffectiveDateString), dateStringToInteger(filters.contractEffectiveDateString));
    }
    if (((_g = filters.cemeteryId) !== null && _g !== void 0 ? _g : '') !== '') {
        sqlWhereClause += ' and (cem.cemeteryId = ? or cem.parentCemeteryId = ?)';
        sqlParameters.push(filters.cemeteryId, filters.cemeteryId);
    }
    if (((_h = filters.burialSiteTypeId) !== null && _h !== void 0 ? _h : '') !== '') {
        sqlWhereClause += ' and b.burialSiteTypeId = ?';
        sqlParameters.push(filters.burialSiteTypeId);
    }
    if (((_j = filters.funeralHomeId) !== null && _j !== void 0 ? _j : '') !== '') {
        sqlWhereClause += ' and c.funeralHomeId = ?';
        sqlParameters.push(filters.funeralHomeId);
    }
    if (((_k = filters.funeralTime) !== null && _k !== void 0 ? _k : '') === 'upcoming') {
        sqlWhereClause += ' and c.funeralDate >= ?';
        sqlParameters.push(dateToInteger(new Date()));
    }
    if (((_l = filters.workOrderId) !== null && _l !== void 0 ? _l : '') !== '') {
        sqlWhereClause +=
            ' and c.contractId in (select contractId from WorkOrderContracts where recordDelete_timeMillis is null and workOrderId = ?)';
        sqlParameters.push(filters.workOrderId);
    }
    if (((_m = filters.notWorkOrderId) !== null && _m !== void 0 ? _m : '') !== '') {
        sqlWhereClause +=
            ' and c.contractId not in (select contractId from WorkOrderContracts where recordDelete_timeMillis is null and workOrderId = ?)';
        sqlParameters.push(filters.notWorkOrderId);
    }
    if (((_o = filters.notContractId) !== null && _o !== void 0 ? _o : '') !== '') {
        sqlWhereClause += ' and c.contractId <> ?';
        sqlParameters.push(filters.notContractId);
    }
    if (((_p = filters.relatedContractId) !== null && _p !== void 0 ? _p : '') !== '') {
        sqlWhereClause += ` and (
        c.contractId in (select contractIdA from RelatedContracts where contractIdB = ?)
        or c.contractId in (select contractIdB from RelatedContracts where contractIdA = ?)
      )`;
        sqlParameters.push(filters.relatedContractId, filters.relatedContractId);
    }
    if (((_q = filters.notRelatedContractId) !== null && _q !== void 0 ? _q : '') !== '') {
        sqlWhereClause += ` and c.contractId not in (select contractIdA from RelatedContracts where contractIdB = ?)
      and c.contractId not in (select contractIdB from RelatedContracts where contractIdA = ?)`;
        sqlParameters.push(filters.notRelatedContractId, filters.notRelatedContractId);
    }
    return {
        sqlParameters,
        sqlWhereClause
    };
}

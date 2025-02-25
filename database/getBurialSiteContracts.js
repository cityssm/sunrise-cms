import { dateIntegerToString, dateStringToInteger } from '@cityssm/utils-datetime';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { getContractTypeById } from '../helpers/functions.cache.js';
import { getBurialSiteNameWhereClause, getOccupancyTimeWhereClause, getOccupantNameWhereClause } from '../helpers/functions.sqlFilters.js';
import getBurialSiteContractFees from './getBurialSiteContractFees.js';
// import getBurialSiteContractOccupants from './getBurialSiteContractOccupants.js'
import getBurialSiteContractTransactions from './getBurialSiteContractTransactions.js';
import { acquireConnection } from './pool.js';
function buildWhereClause(filters) {
    let sqlWhereClause = ' where o.recordDelete_timeMillis is null';
    const sqlParameters = [];
    if ((filters.burialSiteId ?? '') !== '') {
        sqlWhereClause += ' and o.lotId = ?';
        sqlParameters.push(filters.burialSiteId);
    }
    const lotNameFilters = getBurialSiteNameWhereClause(filters.burialSiteName, filters.burialSiteNameSearchType ?? '', 'l');
    sqlWhereClause += lotNameFilters.sqlWhereClause;
    sqlParameters.push(...lotNameFilters.sqlParameters);
    const occupantNameFilters = getOccupantNameWhereClause(filters.occupantName, 'o');
    if (occupantNameFilters.sqlParameters.length > 0) {
        sqlWhereClause += ` and o.burialSiteContractId in (
        select burialSiteContractId from LotOccupancyOccupants o
        where recordDelete_timeMillis is null
        ${occupantNameFilters.sqlWhereClause})`;
        sqlParameters.push(...occupantNameFilters.sqlParameters);
    }
    if ((filters.contractTypeId ?? '') !== '') {
        sqlWhereClause += ' and o.contractTypeId = ?';
        sqlParameters.push(filters.contractTypeId);
    }
    const occupancyTimeFilters = getOccupancyTimeWhereClause(filters.occupancyTime ?? '', 'o');
    sqlWhereClause += occupancyTimeFilters.sqlWhereClause;
    sqlParameters.push(...occupancyTimeFilters.sqlParameters);
    if ((filters.contractStartDateString ?? '') !== '') {
        sqlWhereClause += ' and o.contractStartDate = ?';
        sqlParameters.push(dateStringToInteger(filters.contractStartDateString));
    }
    if ((filters.occupancyEffectiveDateString ?? '') !== '') {
        sqlWhereClause += ` and (
        o.contractEndDate is null
        or (o.contractStartDate <= ? and o.contractEndDate >= ?)
      )`;
        sqlParameters.push(dateStringToInteger(filters.occupancyEffectiveDateString), dateStringToInteger(filters.occupancyEffectiveDateString));
    }
    if ((filters.cemeteryId ?? '') !== '') {
        sqlWhereClause += ' and l.cemeteryId = ?';
        sqlParameters.push(filters.cemeteryId);
    }
    if ((filters.burialSiteTypeId ?? '') !== '') {
        sqlWhereClause += ' and l.burialSiteTypeId = ?';
        sqlParameters.push(filters.burialSiteTypeId);
    }
    if ((filters.workOrderId ?? '') !== '') {
        sqlWhereClause +=
            ' and o.burialSiteContractId in (select burialSiteContractId from WorkOrderBurialSiteContracts where recordDelete_timeMillis is null and workOrderId = ?)';
        sqlParameters.push(filters.workOrderId);
    }
    if ((filters.notWorkOrderId ?? '') !== '') {
        sqlWhereClause +=
            ' and o.burialSiteContractId not in (select burialSiteContractId from WorkOrderBurialSiteContracts where recordDelete_timeMillis is null and workOrderId = ?)';
        sqlParameters.push(filters.notWorkOrderId);
    }
    return {
        sqlWhereClause,
        sqlParameters
    };
}
async function addInclusions(burialSiteContract, options, database) {
    if (options.includeFees) {
        burialSiteContract.burialSiteContractFees = await getBurialSiteContractFees(burialSiteContract.burialSiteContractId, database);
    }
    if (options.includeTransactions) {
        burialSiteContract.burialSiteContractTransactions =
            await getBurialSiteContractTransactions(burialSiteContract.burialSiteContractId, { includeIntegrations: false }, database);
    }
    /*
    if (options.includeInterments) {
      burialSiteContract.burialSiteContractInterments =
        await getBurialSiteContractOccupants(
          burialSiteContract.burialSiteContractId,
          database
        )
    }
    */
    return burialSiteContract;
}
export default async function getBurialSiteContracts(filters, options, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    database.function('userFn_dateIntegerToString', dateIntegerToString);
    const { sqlWhereClause, sqlParameters } = buildWhereClause(filters);
    let count = typeof options.limit === 'string'
        ? Number.parseInt(options.limit, 10)
        : options.limit;
    const isLimited = options.limit !== -1;
    if (isLimited) {
        count = database
            .prepare(`select count(*) as recordCount
          from BurialSiteContracts o
          left join BurialSites l on o.burialSiteId = l.burialSiteId
          ${sqlWhereClause}`)
            .get(sqlParameters).recordCount;
    }
    let burialSiteContracts = [];
    if (count !== 0) {
        burialSiteContracts = database
            .prepare(`select o.burialSiteContractId,
          o.contractTypeId, t.contractType,
          o.burialSiteId, lt.burialSiteType,
          l.burialSiteName,
          l.cemeteryId, m.cemeteryName,
          o.contractStartDate, userFn_dateIntegerToString(o.contractStartDate) as contractStartDateString,
          o.contractEndDate,  userFn_dateIntegerToString(o.contractEndDate) as contractEndDateString
          from BurialSiteContracts o
          left join ContractTypes t on o.contractTypeId = t.contractTypeId
          left join BurialSites l on o.burialSiteId = l.burialSiteId
          left join BurialSiteTypes lt on l.burialSiteTypeId = lt.burialSiteTypeId
          left join Cemeteries m on l.cemeteryId = m.cemeteryId
          ${sqlWhereClause}
          order by o.contractStartDate desc, ifnull(o.contractEndDate, 99999999) desc,
            l.burialSiteNameSegment1,
            l.burialSiteNameSegment2,
            l.burialSiteNameSegment3,
            l.burialSiteNameSegment4,
            l.burialSiteNameSegment5,
            o.burialSiteId, o.burialSiteContractId desc
          ${isLimited ? ` limit ${options.limit} offset ${options.offset}` : ''}`)
            .all(sqlParameters);
        if (!isLimited) {
            count = burialSiteContracts.length;
        }
        for (const burialSiteContract of burialSiteContracts) {
            const contractType = await getContractTypeById(burialSiteContract.contractTypeId);
            if (contractType !== undefined) {
                burialSiteContract.printEJS = (contractType.contractTypePrints ?? []).includes('*')
                    ? getConfigProperty('settings.contracts.prints')[0]
                    : (contractType.contractTypePrints ?? [])[0];
            }
            await addInclusions(burialSiteContract, options, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.release();
    }
    return {
        count,
        burialSiteContracts
    };
}

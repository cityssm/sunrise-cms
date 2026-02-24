import { dateIntegerToString, dateStringToInteger, dateToInteger, timeIntegerToPeriodString, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getCachedContractTypeById } from '../helpers/cache/contractTypes.cache.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sanitizeLimit, sanitizeOffset, sunriseDB } from '../helpers/database.helpers.js';
import { getBurialSiteNameWhereClause, getContractTimeWhereClause, getDeceasedNameWhereClause, getPurchaserNameWhereClause } from '../helpers/functions.sqlFilters.js';
import getContractFees from './getContractFees.js';
import getContractInterments from './getContractInterments.js';
import getContractTransactions from './getContractTransactions.js';
const validOrderByStrings = [
    'c.funeralDate, c.funeralTime, c.contractId'
];
export default async function getContracts(filters, options, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const { sqlParameters, sqlWhereClause } = buildWhereClause(filters);
    let count = typeof options.limit === 'string'
        ? Number.parseInt(options.limit, 10)
        : options.limit;
    const isLimited = options.limit !== -1;
    if (isLimited) {
        count = database
            .prepare(/* sql */ `
        SELECT
          count(*) AS recordCount
        FROM
          Contracts c
          LEFT JOIN BurialSites b ON c.burialSiteId = b.burialSiteId
          LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId ${sqlWhereClause}
      `)
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
            .prepare(/* sql */ `
        SELECT
          c.contractId,
          c.contractNumber,
          c.contractTypeId,
          t.contractType,
          t.isPreneed,
          c.burialSiteId,
          lt.burialSiteType,
          b.burialSiteName,
          CASE
            WHEN b.recordDelete_timeMillis IS NULL THEN 1
            ELSE 0
          END AS burialSiteIsActive,
          b.cemeteryId,
          cem.cemeteryName,
          c.contractStartDate,
          c.contractEndDate,
          c.purchaserName,
          c.purchaserAddress1,
          c.purchaserAddress2,
          c.purchaserCity,
          c.purchaserProvince,
          c.purchaserPostalCode,
          c.purchaserPhoneNumber,
          c.purchaserEmail,
          c.purchaserRelationship,
          c.funeralHomeId,
          c.funeralDirectorName,
          f.funeralHomeName,
          c.funeralDate,
          c.funeralTime,
          c.directionOfArrival,
          c.committalTypeId,
          cm.committalType
        FROM
          Contracts c
          LEFT JOIN ContractTypes t ON c.contractTypeId = t.contractTypeId
          LEFT JOIN CommittalTypes cm ON c.committalTypeId = cm.committalTypeId
          LEFT JOIN BurialSites b ON c.burialSiteId = b.burialSiteId
          LEFT JOIN BurialSiteTypes lt ON b.burialSiteTypeId = lt.burialSiteTypeId
          LEFT JOIN Cemeteries cem ON b.cemeteryId = cem.cemeteryId
          LEFT JOIN FuneralHomes f ON c.funeralHomeId = f.funeralHomeId ${sqlWhereClause} ${options.orderBy !==
            undefined && validOrderByStrings.includes(options.orderBy)
            ? ` order by ${options.orderBy}`
            : ` order by c.contractStartDate desc, ifnull(c.contractEndDate, 99999999) desc,
                  b.burialSiteNameSegment1,
                  b.burialSiteNameSegment2,
                  b.burialSiteNameSegment3,
                  b.burialSiteNameSegment4,
                  b.burialSiteNameSegment5,
                  c.burialSiteId, c.contractId desc`} ${sqlLimitClause}
      `)
            .all(sqlParameters);
        if (!isLimited) {
            count = contracts.length;
        }
        const currentDateInteger = dateToInteger(new Date());
        for (const contract of contracts) {
            /*
             * Format dates and times
             */
            contract.contractStartDateString = dateIntegerToString(contract.contractStartDate);
            contract.contractEndDateString = dateIntegerToString(contract.contractEndDate ?? 0);
            contract.funeralDateString = dateIntegerToString(contract.funeralDate ?? 0);
            contract.funeralTimeString = timeIntegerToString(contract.funeralTime);
            contract.funeralTimePeriodString = timeIntegerToPeriodString(contract.funeralTime);
            contract.contractIsActive =
                contract.contractEndDate === null ||
                    (contract.contractEndDate ?? 0) > currentDateInteger;
            contract.contractIsFuture =
                contract.contractStartDate > currentDateInteger;
            /*
             * Print
             */
            addPrint(contract);
            // eslint-disable-next-line no-await-in-loop
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
function addPrint(contract) {
    const contractType = getCachedContractTypeById(contract.contractTypeId);
    if (contractType !== undefined) {
        contract.printEJS = (contractType.contractTypePrints ?? []).includes('*')
            ? getConfigProperty('settings.contracts.prints')[0]
            : (contractType.contractTypePrints ?? [])[0];
    }
    return contract;
}
async function addInclusions(contract, options, database) {
    if (options.includeFees) {
        contract.contractFees = getContractFees(contract.contractId, database);
    }
    if (options.includeServiceTypes ?? false) {
        contract.contractServiceTypes = database
            .prepare(/* sql */ `
        SELECT
          st.serviceTypeId,
          st.serviceType
        FROM
          ContractServiceTypes cst
          INNER JOIN ServiceTypes st ON cst.serviceTypeId = st.serviceTypeId
        WHERE
          cst.contractId = ?
          AND cst.recordDelete_timeMillis IS NULL
          AND st.recordDelete_timeMillis IS NULL
        ORDER BY
          st.orderNumber,
          st.serviceType
      `)
            .all(contract.contractId);
    }
    if (options.includeTransactions) {
        // eslint-disable-next-line require-atomic-updates
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
    /*
     * Contract Number
     */
    if ((filters.contractNumber ?? '') !== '') {
        sqlWhereClause += " AND c.contractNumber LIKE '%' || ? || '%'";
        sqlParameters.push(filters.contractNumber?.trim());
    }
    /*
     * Burial Site
     */
    if ((filters.burialSiteId ?? '') !== '') {
        sqlWhereClause += ' AND c.burialSiteId = ?';
        sqlParameters.push(filters.burialSiteId);
    }
    const burialSiteNameFilters = getBurialSiteNameWhereClause(filters.burialSiteName, filters.burialSiteNameSearchType ?? '', 'b');
    sqlWhereClause += burialSiteNameFilters.sqlWhereClause;
    sqlParameters.push(...burialSiteNameFilters.sqlParameters);
    /*
     * Purchaser Name
     */
    const purchaserNameFilters = getPurchaserNameWhereClause(filters.purchaserName, 'c');
    if (purchaserNameFilters.sqlParameters.length > 0) {
        sqlWhereClause += purchaserNameFilters.sqlWhereClause;
        sqlParameters.push(...purchaserNameFilters.sqlParameters);
    }
    /*
     * Deceased Name
     */
    const deceasedNameFilters = getDeceasedNameWhereClause(filters.deceasedName, 'ci');
    if (deceasedNameFilters.sqlParameters.length > 0) {
        sqlWhereClause += /* sql */ `
      AND c.contractId IN (
        SELECT
          contractId
        FROM
          ContractInterments ci
        WHERE
          recordDelete_timeMillis IS NULL ${deceasedNameFilters.sqlWhereClause}
      )
    `;
        sqlParameters.push(...deceasedNameFilters.sqlParameters);
    }
    if ((filters.contractTypeId ?? '') !== '') {
        sqlWhereClause += ' AND c.contractTypeId = ?';
        sqlParameters.push(filters.contractTypeId);
    }
    const contractTimeFilters = getContractTimeWhereClause(filters.contractTime ?? '', 'c');
    sqlWhereClause += contractTimeFilters.sqlWhereClause;
    sqlParameters.push(...contractTimeFilters.sqlParameters);
    if ((filters.contractStartDateString ?? '') !== '') {
        sqlWhereClause += ' AND c.contractStartDate = ?';
        sqlParameters.push(dateStringToInteger(filters.contractStartDateString));
    }
    if ((filters.contractEffectiveDateString ?? '') !== '') {
        sqlWhereClause += /* sql */ `
      AND (
        c.contractEndDate IS NULL
        OR (
          c.contractStartDate <= ?
          AND c.contractEndDate >= ?
        )
      )
    `;
        sqlParameters.push(dateStringToInteger(filters.contractEffectiveDateString), dateStringToInteger(filters.contractEffectiveDateString));
    }
    if ((filters.cemeteryId ?? '') !== '') {
        sqlWhereClause += ' AND (cem.cemeteryId = ? OR cem.parentCemeteryId = ?)';
        sqlParameters.push(filters.cemeteryId, filters.cemeteryId);
    }
    if ((filters.burialSiteTypeId ?? '') !== '') {
        sqlWhereClause += ' AND b.burialSiteTypeId = ?';
        sqlParameters.push(filters.burialSiteTypeId);
    }
    if ((filters.serviceTypeId ?? '') !== '') {
        sqlWhereClause += /* sql */ `
      AND EXISTS (
        SELECT
          1
        FROM
          ContractServiceTypes cst
        WHERE
          cst.contractId = c.contractId
          AND cst.serviceTypeId = ?
          AND cst.recordDelete_timeMillis IS NULL
      )
    `;
        sqlParameters.push(filters.serviceTypeId);
    }
    if ((filters.funeralHomeId ?? '') !== '') {
        sqlWhereClause += ' AND c.funeralHomeId = ?';
        sqlParameters.push(filters.funeralHomeId);
    }
    if ((filters.funeralTime ?? '') === 'upcoming') {
        sqlWhereClause += ' AND c.funeralDate >= ?';
        sqlParameters.push(dateToInteger(new Date()));
    }
    if ((filters.workOrderId ?? '') !== '') {
        sqlWhereClause += /* sql */ `
      AND c.contractId IN (
        SELECT
          contractId
        FROM
          WorkOrderContracts
        WHERE
          recordDelete_timeMillis IS NULL
          AND workOrderId = ?
      )
    `;
        sqlParameters.push(filters.workOrderId);
    }
    if ((filters.notWorkOrderId ?? '') !== '') {
        sqlWhereClause += /* sql */ `
      AND c.contractId NOT IN (
        SELECT
          contractId
        FROM
          WorkOrderContracts
        WHERE
          recordDelete_timeMillis IS NULL
          AND workOrderId = ?
      )
    `;
        sqlParameters.push(filters.notWorkOrderId);
    }
    if ((filters.notContractId ?? '') !== '') {
        sqlWhereClause += ' AND c.contractId <> ?';
        sqlParameters.push(filters.notContractId);
    }
    if ((filters.relatedContractId ?? '') !== '') {
        sqlWhereClause += /* sql */ `
      AND (
        c.contractId IN (
          SELECT
            contractIdA
          FROM
            RelatedContracts
          WHERE
            contractIdB = ?
        )
        OR c.contractId IN (
          SELECT
            contractIdB
          FROM
            RelatedContracts
          WHERE
            contractIdA = ?
        )
      )
    `;
        sqlParameters.push(filters.relatedContractId, filters.relatedContractId);
    }
    if ((filters.notRelatedContractId ?? '') !== '') {
        sqlWhereClause += /* sql */ `
      AND c.contractId NOT IN (
        SELECT
          contractIdA
        FROM
          RelatedContracts
        WHERE
          contractIdB = ?
      )
      AND c.contractId NOT IN (
        SELECT
          contractIdB
        FROM
          RelatedContracts
        WHERE
          contractIdA = ?
      )
    `;
        sqlParameters.push(filters.notRelatedContractId, filters.notRelatedContractId);
    }
    return {
        sqlParameters,
        sqlWhereClause
    };
}

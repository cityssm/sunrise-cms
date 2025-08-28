import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default function getFees(feeCategoryId, additionalFilters, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const updateOrderNumbers = !database.readonly &&
        !(additionalFilters.burialSiteTypeId || additionalFilters.contractTypeId);
    let sqlWhereClause = ' where f.recordDelete_timeMillis is null and f.feeCategoryId = ?';
    const sqlParameters = [feeCategoryId];
    if (additionalFilters.contractTypeId) {
        sqlWhereClause += ' and (f.contractTypeId is null or f.contractTypeId = ?)';
        sqlParameters.push(additionalFilters.contractTypeId);
    }
    if (additionalFilters.burialSiteTypeId) {
        sqlWhereClause +=
            ' and (f.burialSiteTypeId is null or f.burialSiteTypeId = ?)';
        sqlParameters.push(additionalFilters.burialSiteTypeId);
    }
    const fees = database
        .prepare(`select f.feeId, f.feeCategoryId,
        f.feeName, f.feeDescription, f.feeAccount,
        f.contractTypeId, ct.contractType,
        f.burialSiteTypeId, l.burialSiteType,
        ifnull(f.feeAmount, 0) as feeAmount,
        f.feeFunction,
        f.taxAmount, f.taxPercentage,
        f.includeQuantity, f.quantityUnit,
        f.isRequired, f.orderNumber,
        ifnull(cf.contractFeeCount, 0) as contractFeeCount
        from Fees f
        left join (
          select feeId, count(contractId) as contractFeeCount
          from ContractFees
          where recordDelete_timeMillis is null
          group by feeId
        ) cf on f.feeId = cf.feeId
        left join ContractTypes ct on f.contractTypeId = ct.contractTypeId
        left join BurialSiteTypes l on f.burialSiteTypeId = l.burialSiteTypeId
        ${sqlWhereClause}
        order by f.orderNumber, f.feeName`)
        .all(sqlParameters);
    if (updateOrderNumbers) {
        let expectedOrderNumber = 0;
        for (const fee of fees) {
            if (fee.orderNumber !== expectedOrderNumber) {
                updateRecordOrderNumber('Fees', fee.feeId, expectedOrderNumber, database);
                fee.orderNumber = expectedOrderNumber;
            }
            expectedOrderNumber += 1;
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return fees;
}

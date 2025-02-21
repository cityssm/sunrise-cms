import { acquireConnection } from './pool.js';
import { updateRecordOrderNumber } from './updateRecordOrderNumber.js';
export default async function getFees(feeCategoryId, additionalFilters, connectedDatabase) {
    const updateOrderNumbers = !(additionalFilters.burialSiteTypeId || additionalFilters.contractTypeId);
    const database = connectedDatabase ?? (await acquireConnection());
    let sqlWhereClause = ' where f.recordDelete_timeMillis is null and f.feeCategoryId = ?';
    const sqlParameters = [feeCategoryId];
    if (additionalFilters.contractTypeId) {
        sqlWhereClause +=
            ' and (f.contractTypeId is null or f.contractTypeId = ?)';
        sqlParameters.push(additionalFilters.contractTypeId);
    }
    if (additionalFilters.burialSiteTypeId) {
        sqlWhereClause += ' and (f.burialSiteTypeId is null or f.burialSiteTypeId = ?)';
        sqlParameters.push(additionalFilters.burialSiteTypeId);
    }
    const fees = database
        .prepare(`select f.feeId, f.feeCategoryId,
        f.feeName, f.feeDescription, f.feeAccount,
        f.contractTypeId, o.contractType,
        f.burialSiteTypeId, l.burialSiteType,
        ifnull(f.feeAmount, 0) as feeAmount,
        f.feeFunction,
        f.taxAmount, f.taxPercentage,
        f.includeQuantity, f.quantityUnit,
        f.isRequired, f.orderNumber,
        ifnull(lo.burialSiteContractFeeCount, 0) as burialSiteContractFeeCount
        from Fees f
        left join (
          select feeId, count(burialSiteContractId) as burialSiteContractFeeCount
          from BurialSiteContractFees
          where recordDelete_timeMillis is null
          group by feeId
        ) lo on f.feeId = lo.feeId
        left join ContractTypes o on f.contractTypeId = o.contractTypeId
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
        database.release();
    }
    return fees;
}

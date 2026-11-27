import { getDatabaseConnection } from '../helpers/database.helpers.js';
export default function getContractFees(contractId, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection(true);
    const contractIds = Array.isArray(contractId) ? contractId : [contractId];
    const contractIdPlaceholders = contractIds.map(() => '?').join(', ');
    const fees = database
        .prepare(`
      SELECT
        cf.contractId,
        cf.feeId,
        c.feeCategory,
        f.feeName,
        f.includeQuantity,
        cf.feeAmount,
        cf.taxAmount,
        cf.quantity,
        f.quantityUnit
      FROM
        ContractFees cf
        LEFT JOIN Fees f ON cf.feeId = f.feeId
        LEFT JOIN FeeCategories c ON f.feeCategoryId = c.feeCategoryId
      WHERE
        cf.recordDelete_timeMillis IS NULL
        AND cf.contractId IN (${contractIdPlaceholders})
      ORDER BY
        cf.recordCreate_timeMillis
    `)
        .all(...contractIds);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return fees;
}

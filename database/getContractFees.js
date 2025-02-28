import { acquireConnection } from './pool.js';
export default async function getContractFees(contractId, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    const fees = database
        .prepare(`select o.contractId, o.feeId,
        c.feeCategory, f.feeName,
        f.includeQuantity, o.feeAmount, o.taxAmount, o.quantity, f.quantityUnit
        from ContractFees o
        left join Fees f on o.feeId = f.feeId
        left join FeeCategories c on f.feeCategoryId = c.feeCategoryId
        where o.recordDelete_timeMillis is null
        and o.contractId = ?
        order by o.recordCreate_timeMillis`)
        .all(contractId);
    if (connectedDatabase === undefined) {
        database.release();
    }
    return fees;
}

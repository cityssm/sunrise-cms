import { acquireConnection } from './pool.js';
export default async function getBurialSiteContractFees(burialSiteContractId, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    const fees = database
        .prepare(`select o.burialSiteContractId, o.feeId,
        c.feeCategory, f.feeName,
        f.includeQuantity, o.feeAmount, o.taxAmount, o.quantity, f.quantityUnit
        from BurialSiteContractFees o
        left join Fees f on o.feeId = f.feeId
        left join FeeCategories c on f.feeCategoryId = c.feeCategoryId
        where o.recordDelete_timeMillis is null
        and o.burialSiteContractId = ?
        order by o.recordCreate_timeMillis`)
        .all(burialSiteContractId);
    if (connectedDatabase === undefined) {
        database.release();
    }
    return fees;
}

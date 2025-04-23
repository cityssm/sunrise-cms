import { acquireConnection } from './pool.js';
export default async function getPreviousContractId(contractId) {
    const database = await acquireConnection();
    const result = database
        .prepare(`select contractId
        from Contracts
        where recordDelete_timeMillis is null
        and contractId < ?
        order by contractId desc
        limit 1`)
        .pluck()
        .get(contractId);
    database.release();
    return result;
}

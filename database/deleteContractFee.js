import { acquireConnection } from './pool.js';
export default async function deleteContractFee(contractId, feeId, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update ContractFees
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where contractId = ?
        and feeId = ?`)
        .run(user.userName, Date.now(), contractId, feeId);
    database.release();
    return result.changes > 0;
}

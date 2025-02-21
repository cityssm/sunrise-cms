import { acquireConnection } from './pool.js';
export default async function deleteBurialSiteContractTransaction(burialSiteContractId, transactionIndex, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update BurialSiteContractTransactions
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteContractId = ?
        and transactionIndex = ?`)
        .run(user.userName, Date.now(), burialSiteContractId, transactionIndex);
    database.release();
    return result.changes > 0;
}

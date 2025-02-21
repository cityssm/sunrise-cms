import { acquireConnection } from './pool.js';
export default async function deleteBurialSiteContractInterment(burialSiteContractId, intermentNumber, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update BurialSiteContractInterments
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteContractId = ?
        and intermentNumber = ?`)
        .run(user.userName, Date.now(), burialSiteContractId, intermentNumber);
    database.release();
    return result.changes > 0;
}

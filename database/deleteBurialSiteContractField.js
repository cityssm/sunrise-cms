import { acquireConnection } from './pool.js';
export default async function deleteBurialSiteContractField(burialSiteContractId, contractTypeFieldId, user, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    const result = database
        .prepare(`update BurialSiteContractFields
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where burialSiteContractId = ?
        and contractTypeFieldId = ?`)
        .run(user.userName, Date.now(), burialSiteContractId, contractTypeFieldId);
    if (connectedDatabase === undefined) {
        database.release();
    }
    return result.changes > 0;
}

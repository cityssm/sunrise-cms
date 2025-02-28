import { acquireConnection } from './pool.js';
export default async function deleteContractField(contractId, contractTypeFieldId, user, connectedDatabase) {
    const database = connectedDatabase ?? (await acquireConnection());
    const result = database
        .prepare(`update ContractFields
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where contractId = ?
        and contractTypeFieldId = ?`)
        .run(user.userName, Date.now(), contractId, contractTypeFieldId);
    if (connectedDatabase === undefined) {
        database.release();
    }
    return result.changes > 0;
}

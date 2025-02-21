import { acquireConnection } from './pool.js';
export default async function deleteWorkOrderBurialSiteContract(workOrderId, burialSiteContractId, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update WorkOrderBurialSiteContracts
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where workOrderId = ?
        and burialSiteContractId = ?`)
        .run(user.userName, Date.now(), workOrderId, burialSiteContractId);
    database.release();
    return result.changes > 0;
}

import { acquireConnection } from './pool.js';
export default async function updateBurialSiteContractFeeQuantity(feeQuantityForm, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update BurialSiteContractFees
        set quantity = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and burialSiteContractId = ?
        and feeId = ?`)
        .run(feeQuantityForm.quantity, user.userName, Date.now(), feeQuantityForm.burialSiteContractId, feeQuantityForm.feeId);
    database.release();
    return result.changes > 0;
}

import { acquireConnection } from './pool.js';
export default async function updateFee(feeForm, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update Fees
        set feeCategoryId = ?,
          feeName = ?,
          feeDescription = ?,
          feeAccount = ?,
          contractTypeId = ?,
          burialSiteTypeId = ?,
          feeAmount = ?,
          feeFunction = ?,
          taxAmount = ?,
          taxPercentage = ?,
          includeQuantity = ?,
          quantityUnit = ?,
          isRequired = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
          and feeId = ?`)
        .run(feeForm.feeCategoryId, feeForm.feeName, feeForm.feeDescription, feeForm.feeAccount, feeForm.contractTypeId === '' ? undefined : feeForm.contractTypeId, feeForm.burialSiteTypeId === '' ? undefined : feeForm.burialSiteTypeId, feeForm.feeAmount === undefined || feeForm.feeAmount === ''
        ? 0
        : feeForm.feeAmount, feeForm.feeFunction ?? undefined, feeForm.taxAmount === '' ? undefined : feeForm.taxAmount, feeForm.taxPercentage === '' ? undefined : feeForm.taxPercentage, feeForm.includeQuantity === '' ? 0 : 1, feeForm.quantityUnit, feeForm.isRequired === '' ? 0 : 1, user.userName, Date.now(), feeForm.feeId);
    database.release();
    return result.changes > 0;
}
export async function updateFeeAmount(feeAmountForm, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update Fees
        set feeAmount = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
        and feeId = ?`)
        .run(feeAmountForm.feeAmount, user.userName, Date.now(), feeAmountForm.feeId);
    database.release();
    return result.changes > 0;
}

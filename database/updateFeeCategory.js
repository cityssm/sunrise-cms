import { acquireConnection } from './pool.js';
export default async function updateFeeCategory(feeCategoryForm, user) {
    const database = await acquireConnection();
    const result = database
        .prepare(`update FeeCategories
        set feeCategory = ?,
          isGroupedFee = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
          and feeCategoryId = ?`)
        .run(feeCategoryForm.feeCategory, (feeCategoryForm.isGroupedFee ?? '') === '1' ? 1 : 0, user.userName, Date.now(), feeCategoryForm.feeCategoryId);
    database.release();
    return result.changes > 0;
}

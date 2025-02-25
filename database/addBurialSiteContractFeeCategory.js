import addBurialSiteContractFee from './addBurialSiteContractFee.js';
import { getFeeCategory } from './getFeeCategories.js';
import { acquireConnection } from './pool.js';
export default async function addBurialSiteContractFeeCategory(addFeeCategoryForm, user) {
    const database = await acquireConnection();
    const feeCategory = await getFeeCategory(addFeeCategoryForm.feeCategoryId, database);
    let addedFeeCount = 0;
    for (const fee of feeCategory?.fees ?? []) {
        const success = await addBurialSiteContractFee({
            burialSiteContractId: addFeeCategoryForm.burialSiteContractId,
            feeId: fee.feeId,
            quantity: 1
        }, user, database);
        if (success) {
            addedFeeCount += 1;
        }
    }
    database.release();
    return addedFeeCount;
}

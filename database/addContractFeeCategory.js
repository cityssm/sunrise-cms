import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
import addContractFee from './addContractFee.js';
import { getFeeCategory } from './getFeeCategories.js';
export default async function addContractFeeCategory(form, user, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    const feeCategory = getFeeCategory(form.feeCategoryId, database);
    let addedFeeCount = 0;
    const fees = feeCategory?.fees ?? [];
    for (const fee of fees) {
        const success = await addContractFee({
            contractId: form.contractId,
            feeId: fee.feeId,
            quantity: 1
        }, user, database);
        if (success) {
            addedFeeCount += 1;
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return addedFeeCount;
}

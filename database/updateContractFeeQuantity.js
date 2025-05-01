import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function updateContractFeeQuantity(feeQuantityForm, user) {
    const database = sqlite(sunriseDB);
    const result = database
        .prepare(`update ContractFees
        set quantity = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where recordDelete_timeMillis is null
          and contractId = ?
          and feeId = ?`)
        .run(feeQuantityForm.quantity, user.userName, Date.now(), feeQuantityForm.contractId, feeQuantityForm.feeId);
    database.close();
    return result.changes > 0;
}

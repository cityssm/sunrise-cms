import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function updateContractFeeQuantity(feeQuantityForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const result = database
        .prepare(/* sql */ `
      UPDATE ContractFees
      SET
        quantity = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId = ?
        AND feeId = ?
    `)
        .run(feeQuantityForm.quantity, user.userName, Date.now(), feeQuantityForm.contractId, feeQuantityForm.feeId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}

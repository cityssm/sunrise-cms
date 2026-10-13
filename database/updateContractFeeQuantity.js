import { getDatabaseConnection } from '../helpers/database.helpers.js';
export default function updateContractFeeQuantity(feeQuantityForm, user, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const result = database
        .prepare(`
      UPDATE ContractFees
      SET
        quantity = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId = ?
        AND feeId = ?
    `)
        .run(feeQuantityForm.quantity, user.username, Date.now(), feeQuantityForm.contractId, feeQuantityForm.feeId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}

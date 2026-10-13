import { getDatabaseConnection } from '../helpers/database.helpers.js';
export default function deleteContractField(contractId, contractTypeFieldId, user, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const result = database
        .prepare(`
      UPDATE ContractFields
      SET
        recordDelete_username = ?,
        recordDelete_timeMillis = ?
      WHERE
        contractId = ?
        AND contractTypeFieldId = ?
    `)
        .run(user.username, Date.now(), contractId, contractTypeFieldId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}

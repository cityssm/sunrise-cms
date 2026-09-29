import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function deleteContractMetadata(contractId, metadataKey, user, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    database
        .prepare(`
      UPDATE ContractMetadata
      SET
        recordDelete_username = ?,
        recordDelete_timeMillis = ?
      WHERE
        contractId = ?
        AND metadataKey = ?
    `)
        .run(user.username, Date.now(), contractId, metadataKey);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return true;
}

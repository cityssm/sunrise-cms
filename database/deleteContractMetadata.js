import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function deleteContractMetadata(contractId, metadataKey, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    database
        .prepare(/* sql */ `
      UPDATE ContractMetadata
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        contractId = ?
        AND metadataKey = ?
    `)
        .run(user.userName, Date.now(), contractId, metadataKey);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return true;
}

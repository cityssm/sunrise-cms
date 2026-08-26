import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function updateContractMetadata(contractId, metadata, user, connectedDatabase) {
    const rightNow = Date.now();
    const database = connectedDatabase ?? sqlite(sunriseDB);
    let result = database
        .prepare(`
      UPDATE ContractMetadata
      SET
        metadataValue = ?,
        recordUpdate_username = ?,
        recordUpdate_timeMillis = ?,
        recordDelete_username = NULL,
        recordDelete_timeMillis = NULL
      WHERE
        contractId = ?
        AND metadataKey = ?
    `)
        .run(metadata.metadataValue, user.username, rightNow, contractId, metadata.metadataKey);
    if (result.changes <= 0) {
        result = database
            .prepare(`
        INSERT INTO
          ContractMetadata (
            contractId,
            metadataKey,
            metadataValue,
            recordCreate_username,
            recordCreate_timeMillis,
            recordUpdate_username,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `)
            .run(contractId, metadata.metadataKey, metadata.metadataValue, user.username, rightNow, user.username, rightNow);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}

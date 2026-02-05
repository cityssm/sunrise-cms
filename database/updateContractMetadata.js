import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function updateContractMetadata(contractId, metadata, user, connectedDatabase) {
    const rightNow = Date.now();
    const database = connectedDatabase ?? sqlite(sunriseDB);
    let result = database
        .prepare(/* sql */ `
      UPDATE ContractMetadata
      SET
        metadataValue = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?,
        recordDelete_userName = NULL,
        recordDelete_timeMillis = NULL
      WHERE
        contractId = ?
        AND metadataKey = ?
    `)
        .run(metadata.metadataValue, user.userName, rightNow, contractId, metadata.metadataKey);
    if (result.changes <= 0) {
        result = database
            .prepare(/* sql */ `
        INSERT INTO
          ContractMetadata (
            contractId,
            metadataKey,
            metadataValue,
            recordCreate_userName,
            recordCreate_timeMillis,
            recordUpdate_userName,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `)
            .run(contractId, metadata.metadataKey, metadata.metadataValue, user.userName, rightNow, user.userName, rightNow);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}

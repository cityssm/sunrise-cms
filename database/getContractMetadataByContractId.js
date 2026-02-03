import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getContractMetadataByContractId(contractId, startsWith = '', connectedDatabase = undefined) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const result = database
        .prepare(/* sql */ `
      SELECT
        metadataKey,
        metadataValue
      FROM
        ContractMetadata
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId = ?
        AND metadataKey like ? || '%'
      ORDER BY
        metadataKey
    `)
        .all(contractId, startsWith);
    if (connectedDatabase === undefined) {
        database.close();
    }
    const metadata = {};
    for (const row of result) {
        metadata[row.metadataKey] = row.metadataValue;
    }
    return metadata;
}

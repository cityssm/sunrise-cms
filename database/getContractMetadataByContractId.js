import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getContractMetadataByContractId(contractId, startsWith = '', connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB, { readOnly: true });
    const result = database
        .prepare(`
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

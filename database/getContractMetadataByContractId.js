import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getContractMetadataByContractId(contractId, startsWith = '', connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const result = database
        .prepare(`select metadataKey, metadataValue
        from ContractMetadata
        where recordDelete_timeMillis is null
        and contractId = ?
        and metadataKey like ? || '%'
        order by metadataKey`)
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

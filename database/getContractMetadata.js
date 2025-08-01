import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getContractMetadata(filters) {
    const database = sqlite(sunriseDB, { readonly: true });
    let sql = `select contractId, metadataKey, metadataValue, recordUpdate_timeMillis
    from ContractMetadata
    where recordDelete_timeMillis is null`;
    const sqlParameters = [];
    if (filters.contractId !== undefined) {
        sql += ' and contractId = ?';
        sqlParameters.push(filters.contractId);
    }
    if (filters.startsWith !== undefined && filters.startsWith !== '') {
        sql += " and metadataKey like ? || '%'";
        sqlParameters.push(filters.startsWith);
    }
    const rows = database.prepare(sql).all(sqlParameters);
    database.close();
    return rows;
}

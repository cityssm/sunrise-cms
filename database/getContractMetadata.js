import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getContractMetadata(filters, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    let sql = /* sql */ `
    SELECT
      contractId,
      metadataKey,
      metadataValue,
      recordUpdate_timeMillis
    FROM
      ContractMetadata
    WHERE
      recordDelete_timeMillis IS NULL
  `;
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
    if (connectedDatabase === undefined) {
        database.close();
    }
    return rows;
}

import { getDatabaseConnection } from '../helpers/database.helpers.js';
export default function getContractMetadata(filters, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection(true);
    let sql = `
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
        sql += ' AND contractId = ?';
        sqlParameters.push(filters.contractId);
    }
    if (filters.startsWith !== undefined && filters.startsWith !== '') {
        sql += " AND metadataKey like ? || '%'";
        sqlParameters.push(filters.startsWith);
    }
    const rows = database
        .prepare(sql)
        .all(...sqlParameters);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return rows;
}

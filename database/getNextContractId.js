import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getNextContractId(contractId, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB, { readOnly: true });
    const result = database
        .prepare(`
      SELECT
        contractId
      FROM
        Contracts
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractNumber > (
          SELECT
            contractNumber
          FROM
            Contracts
          WHERE
            contractId = ?
        )
      ORDER BY
        contractNumber
      LIMIT
        1
    `)
        .get(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result?.contractId;
}

import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getPreviousContractId(contractId, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    const result = database
        .prepare(`
      SELECT
        contractId
      FROM
        Contracts
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractNumber < (
          SELECT
            contractNumber
          FROM
            Contracts
          WHERE
            contractId = ?
        )
      ORDER BY
        contractNumber DESC
      LIMIT
        1
    `)
        .get(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result?.contractId;
}

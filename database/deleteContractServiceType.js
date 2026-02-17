import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function deleteContractServiceType(contractId, serviceTypeId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const info = database
        .prepare(/* sql */ `
      UPDATE
        ContractServiceTypes
      SET
        recordDelete_userName = ?,
        recordDelete_timeMillis = ?
      WHERE
        contractId = ?
        AND serviceTypeId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(user.userName, rightNowMillis, contractId, serviceTypeId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return info.changes > 0;
}

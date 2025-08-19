import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function deleteContractFee(contractId, feeId, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const result = database
        .prepare(`update ContractFees
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where contractId = ?
        and feeId = ?`)
        .run(user.userName, Date.now(), contractId, feeId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}

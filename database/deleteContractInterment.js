import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function deleteContractInterment(contractId, intermentNumber, user) {
    const database = sqlite(sunriseDB);
    const result = database
        .prepare(`update ContractInterments
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where contractId = ?
        and intermentNumber = ?`)
        .run(user.userName, Date.now(), contractId, intermentNumber);
    database.close();
    return result.changes > 0;
}

import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getPreviousContractId(contractId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const result = database
        .prepare(`select contractId
        from Contracts
        where recordDelete_timeMillis is null
        and contractId < ?
        order by contractId desc
        limit 1`)
        .pluck()
        .get(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result;
}

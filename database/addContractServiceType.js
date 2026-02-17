import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addContractServiceType(addForm, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    try {
        const result = database
            .prepare(/* sql */ `
        INSERT INTO
          ContractServiceTypes (
            contractId,
            serviceTypeId,
            contractServiceDetails,
            recordCreate_userName,
            recordCreate_timeMillis,
            recordUpdate_userName,
            recordUpdate_timeMillis
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `)
            .run(addForm.contractId, addForm.serviceTypeId, addForm.contractServiceDetails ?? '', user.userName, rightNowMillis, user.userName, rightNowMillis);
        if (connectedDatabase === undefined) {
            database.close();
        }
        return result.changes > 0;
    }
    catch {
        if (connectedDatabase === undefined) {
            database.close();
        }
        return false;
    }
}

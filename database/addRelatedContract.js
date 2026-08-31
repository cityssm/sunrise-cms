import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addRelatedContract(relatedContractForm, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const contractId = Math.trunc(Number(relatedContractForm.contractId.toString()));
    const relatedContractId = Math.trunc(Number(relatedContractForm.relatedContractId.toString()));
    database
        .prepare(`
      INSERT INTO
        RelatedContracts (contractIdA, contractIdB)
      VALUES
        (?, ?)
    `)
        .run(Math.min(contractId, relatedContractId), Math.max(contractId, relatedContractId));
    if (connectedDatabase === undefined) {
        database.close();
    }
    return true;
}

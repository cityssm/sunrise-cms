import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addRelatedContract(relatedContractForm, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const contractId = Number.parseInt(relatedContractForm.contractId.toString(), 10);
    const relatedContractId = Number.parseInt(relatedContractForm.relatedContractId.toString(), 10);
    database
        .prepare(/* sql */ `
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

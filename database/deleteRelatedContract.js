import { getDatabaseConnection } from '../helpers/database.helpers.js';
export default function deleteRelatedContract(relatedContractForm, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    database
        .prepare(`
      DELETE FROM RelatedContracts
      WHERE
        (
          contractIdA = ?
          AND contractIdB = ?
        )
        OR (
          contractIdA = ?
          AND contractIdB = ?
        )
    `)
        .run(relatedContractForm.contractId, relatedContractForm.relatedContractId, relatedContractForm.relatedContractId, relatedContractForm.contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return true;
}

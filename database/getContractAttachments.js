import { getDatabaseConnection } from '../helpers/database.helpers.js';
export default function getContractAttachments(contractId, connectedDatabase) {
    const database = connectedDatabase ?? getDatabaseConnection();
    const attachments = database
        .prepare(`
      SELECT
        contractAttachmentId,
        attachmentTitle,
        attachmentDetails,
        fileName,
        recordCreate_timeMillis
      FROM
        ContractAttachments
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractId = ?
      ORDER BY
        contractAttachmentId
    `)
        .all(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return attachments;
}

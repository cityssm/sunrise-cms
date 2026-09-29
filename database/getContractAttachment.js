import { DatabaseSync } from 'node:sqlite';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getContractAttachment(contractAttachmentId, connectedDatabase) {
    const database = connectedDatabase ?? new DatabaseSync(sunriseDB);
    const attachment = database
        .prepare(`
      SELECT
        contractAttachmentId,
        contractId,
        attachmentTitle,
        attachmentDetails,
        fileName,
        filePath,
        recordCreate_timeMillis
      FROM
        ContractAttachments
      WHERE
        recordDelete_timeMillis IS NULL
        AND contractAttachmentId = ?
    `)
        .get(contractAttachmentId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return attachment;
}

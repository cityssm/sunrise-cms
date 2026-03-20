import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getContractAttachment(contractAttachmentId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const attachment = database
        .prepare(/* sql */ `
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

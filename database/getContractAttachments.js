import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getContractAttachments(contractId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const attachments = database
        .prepare(/* sql */ `
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

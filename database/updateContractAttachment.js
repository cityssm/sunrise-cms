import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function updateContractAttachment(contractAttachmentId, attachment, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(/* sql */ `
      UPDATE ContractAttachments
      SET
        attachmentTitle = ?,
        attachmentDetails = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
      WHERE
        contractAttachmentId = ?
        AND recordDelete_timeMillis IS NULL
    `)
        .run(attachment.attachmentTitle ?? '', attachment.attachmentDetails ?? '', user.userName, rightNowMillis, contractAttachmentId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}

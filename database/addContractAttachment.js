import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addContractAttachment(attachment, user) {
    const database = sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`insert into ContractAttachments (
        contractId, attachmentTitle, attachmentDetails,
        fileName, filePath,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(attachment.contractId, attachment.attachmentTitle ?? attachment.fileName, attachment.attachmentDetails ?? '', attachment.fileName, attachment.filePath, user.userName, rightNowMillis, user.userName, rightNowMillis);
    database.close();
    return result.lastInsertRowid;
}

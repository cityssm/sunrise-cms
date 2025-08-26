import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function addContractAttachment(attachment, user, connectedDatabase) {
    var _a, _b;
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`insert into ContractAttachments (
        contractId, attachmentTitle, attachmentDetails,
        fileName, filePath,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(attachment.contractId, (_a = attachment.attachmentTitle) !== null && _a !== void 0 ? _a : attachment.fileName, (_b = attachment.attachmentDetails) !== null && _b !== void 0 ? _b : '', attachment.fileName, attachment.filePath, user.userName, rightNowMillis, user.userName, rightNowMillis);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.lastInsertRowid;
}

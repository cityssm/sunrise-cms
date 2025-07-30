import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getContractAttachment(contractAttachmentId) {
    const database = sqlite(sunriseDB, { readonly: true });
    const attachment = database
        .prepare(`select contractAttachmentId, contractId,
          attachmentTitle, attachmentDetails,
          fileName, filePath,
          recordCreate_timeMillis
        from ContractAttachments
        where recordDelete_timeMillis is null
          and contractAttachmentId = ?`)
        .get(contractAttachmentId);
    database.close();
    return attachment;
}

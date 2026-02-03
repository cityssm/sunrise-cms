import sqlite from 'better-sqlite3';
import { sunriseDB } from '../helpers/database.helpers.js';
export default function getContractAttachments(contractId, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true });
    const attachments = database
        .prepare(/* sql */ `select contractAttachmentId,
          attachmentTitle, attachmentDetails,
          fileName, recordCreate_timeMillis
        from ContractAttachments
        where recordDelete_timeMillis is null
          and contractId = ?
        order by contractAttachmentId`)
        .all(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return attachments;
}

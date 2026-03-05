import getObjectDifference from '@cityssm/object-difference';
import sqlite from 'better-sqlite3';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { sunriseDB } from '../helpers/database.helpers.js';
import createAuditLogEntries from './createAuditLogEntries.js';
const auditLogIsEnabled = getConfigProperty('settings.auditLog.enabled');
export default function updateContractAttachment(contractAttachmentId, attachment, user, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(sunriseDB);
    const rightNowMillis = Date.now();
    const recordBefore = auditLogIsEnabled
        ? database
            .prepare(/* sql */ `
          SELECT
            *
          FROM
            ContractAttachments
          WHERE
            contractAttachmentId = ?
            AND recordDelete_timeMillis IS NULL
        `)
            .get(contractAttachmentId)
        : undefined;
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
    if (result.changes > 0 && auditLogIsEnabled && recordBefore !== undefined) {
        const parentId = recordBefore
            .contractId;
        const recordAfter = database
            .prepare(/* sql */ `
        SELECT
          *
        FROM
          ContractAttachments
        WHERE
          contractAttachmentId = ?
      `)
            .get(contractAttachmentId);
        const differences = getObjectDifference(recordBefore, recordAfter);
        if (differences.length > 0) {
            createAuditLogEntries({
                mainRecordId: parentId,
                mainRecordType: 'contract',
                recordIndex: contractAttachmentId,
                updateTable: 'ContractAttachments'
            }, differences, user, database);
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.changes > 0;
}

import getAuditLog from '../../database/getAuditLog.js';
export default function handler(request, response) {
    const auditLogEntries = getAuditLog({
        logDate: request.body.logDate ?? '',
        mainRecordType: request.body.mainRecordType ?? ''
    });
    response.json({
        auditLogEntries
    });
}

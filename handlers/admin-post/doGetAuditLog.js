import getAuditLog, { defaultAuditLogLimit } from '../../database/getAuditLog.js';
export default function handler(request, response) {
    const limit = typeof request.body.limit === 'number'
        ? request.body.limit
        : Number.parseInt(request.body.limit ?? defaultAuditLogLimit.toString(), 10);
    const offset = typeof request.body.offset === 'number'
        ? request.body.offset
        : Number.parseInt(request.body.offset ?? '0', 10);
    const result = getAuditLog({
        logDateFrom: request.body.logDateFrom ?? '',
        logDateTo: request.body.logDateTo ?? '',
        mainRecordType: request.body.mainRecordType ?? '',
        updateUserName: request.body.updateUserName ?? ''
    }, { limit, offset });
    response.json({
        auditLogEntries: result.auditLogEntries,
        count: result.count,
        offset
    });
}

import getAuditLog, { defaultAuditLogLimit } from '../../database/getAuditLog.js';
export default function handler(request, response) {
    const limit = typeof request.body.limit === 'number'
        ? request.body.limit
        : Math.trunc(Number(request.body.limit ?? defaultAuditLogLimit.toString()));
    const offset = typeof request.body.offset === 'number'
        ? request.body.offset
        : Math.trunc(Number(request.body.offset ?? '0'));
    const result = getAuditLog({
        logDateFrom: request.body.logDateFrom ?? '',
        logDateTo: request.body.logDateTo ?? '',
        mainRecordType: request.body.mainRecordType ?? '',
        updateUsername: request.body.updateUsername ?? ''
    }, { limit, offset });
    response.json({
        auditLogEntries: result.auditLogEntries,
        count: result.count,
        offset
    });
}

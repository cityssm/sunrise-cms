import getAuditLog, { defaultAuditLogLimit } from '../../database/getAuditLog.js';
const forbiddenStatus = 403;
export default function createHandler(expectedMainRecordType) {
    return function handler(request, response) {
        if (request.body.mainRecordType !== expectedMainRecordType) {
            response
                .status(forbiddenStatus)
                .json({ message: 'Forbidden', success: false });
            return;
        }
        const limit = typeof request.body.limit === 'number'
            ? request.body.limit
            : Math.trunc(Number(request.body.limit ?? defaultAuditLogLimit.toString()));
        const offset = typeof request.body.offset === 'number'
            ? request.body.offset
            : Math.trunc(Number(request.body.offset ?? '0'));
        const result = getAuditLog({
            mainRecordId: request.body.mainRecordId ?? '',
            mainRecordType: expectedMainRecordType
        }, { limit, offset });
        response.json({
            success: true,
            auditLogEntries: result.auditLogEntries,
            count: result.count,
            offset
        });
    };
}

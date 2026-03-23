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
            : Number.parseInt(request.body.limit ?? defaultAuditLogLimit.toString(), 10);
        const offset = typeof request.body.offset === 'number'
            ? request.body.offset
            : Number.parseInt(request.body.offset ?? '0', 10);
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

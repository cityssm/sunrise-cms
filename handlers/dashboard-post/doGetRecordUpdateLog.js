import getRecordUpdateLog, { defaultRecordLimit } from '../../database/getRecordUpdateLog.js';
export default function handler(request, response) {
    const updateLog = getRecordUpdateLog({
        recordType: request.body.recordType ?? ''
    }, {
        limit: typeof request.body.limit === 'number'
            ? request.body.limit
            : Number.parseInt(request.body.limit ?? defaultRecordLimit.toString(), 10),
        offset: typeof request.body.offset === 'number'
            ? request.body.offset
            : Number.parseInt(request.body.offset ?? '0', 10)
    });
    response.json({
        updateLog
    });
}

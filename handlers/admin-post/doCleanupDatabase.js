import cleanupDatabase from '../../database/cleanupDatabase.js';
export default function handler(request, response) {
    const recordCounts = cleanupDatabase(request.session.user);
    response.json({
        success: true,
        inactivatedRecordCount: recordCounts.inactivatedRecordCount,
        purgedRecordCount: recordCounts.purgedRecordCount
    });
}

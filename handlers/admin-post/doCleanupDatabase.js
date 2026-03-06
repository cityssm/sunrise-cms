import cleanupDatabase from '../../database/cleanupDatabase.js';
export default async function handler(request, response) {
    const recordCounts = await cleanupDatabase(request.session.user);
    response.json({
        inactivatedRecordCount: recordCounts.inactivatedRecordCount,
        purgedRecordCount: recordCounts.purgedRecordCount
    });
}

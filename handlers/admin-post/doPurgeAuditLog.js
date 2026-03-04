import purgeAuditLog from '../../database/purgeAuditLog.js';
const validAges = new Set([
    'all',
    'ninetyDays',
    'oneYear',
    'thirtyDays'
]);
export default function handler(request, response) {
    const age = request.body.age;
    if (age === undefined || !validAges.has(age)) {
        response.status(400).json({
            message: 'A valid purge age is required.',
            success: false
        });
        return;
    }
    const purgedCount = purgeAuditLog(age);
    response.json({
        purgedCount,
        success: true
    });
}

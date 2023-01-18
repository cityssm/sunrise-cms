import { acquireConnection } from './pool.js';
export async function reopenWorkOrderMilestone(workOrderMilestoneId, requestSession) {
    const database = await acquireConnection();
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`update WorkOrderMilestones
        set workOrderMilestoneCompletionDate = null,
        workOrderMilestoneCompletionTime = null,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where workOrderMilestoneId = ?
        and workOrderMilestoneCompletionDate is not null`)
        .run(requestSession.user.userName, rightNowMillis, workOrderMilestoneId);
    database.release();
    return result.changes > 0;
}
export default reopenWorkOrderMilestone;

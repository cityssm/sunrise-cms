import { dateToString } from '@cityssm/utils-datetime';
import getWorkOrders from '../../database/getWorkOrders.js';
export default async function handler(request, response) {
    const result = await getWorkOrders({
        cemeteryId: request.body.cemeteryId,
        workOrderMilestoneDateString: request.body.workdayDateString
    }, {
        limit: -1,
        offset: 0,
        includeBurialSites: true,
        includeMilestones: true
    });
    const summaryResult = await getWorkOrders({
        cemeteryId: request.body.cemeteryId
    }, {
        includeMilestones: true,
        limit: -1,
        offset: 0
    });
    const todayDateString = dateToString(new Date());
    const incompleteMilestoneCounts = new Map();
    for (const workOrder of summaryResult.workOrders) {
        const workOrderMilestones = workOrder.workOrderMilestones ?? [];
        for (const milestone of workOrderMilestones) {
            if (milestone.workOrderMilestoneCompletionDate !== null ||
                milestone.workOrderMilestoneDateString === undefined ||
                milestone.workOrderMilestoneDateString >= todayDateString) {
                continue;
            }
            const count = incompleteMilestoneCounts.get(milestone.workOrderMilestoneDateString) ??
                0;
            incompleteMilestoneCounts.set(milestone.workOrderMilestoneDateString, count + 1);
        }
    }
    const incompleteMilestoneDayEntries = Array.from(incompleteMilestoneCounts, ([workdayDateString, incompleteMilestoneCount]) => [workdayDateString, incompleteMilestoneCount]);
    const incompleteMilestoneDays = incompleteMilestoneDayEntries
        .toSorted(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([workdayDateString, incompleteMilestoneCount]) => ({
        incompleteMilestoneCount,
        workdayDateString: workdayDateString
    }));
    response.json({
        incompleteMilestoneDays,
        workOrders: result.workOrders
    });
}

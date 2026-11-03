import { debuglog } from 'node:util';
import completeWorkOrderMilestone from '../../database/completeWorkOrderMilestone.js';
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getDatabaseConnection } from '../../helpers/database.helpers.js';
const debug = debuglog(`${DEBUG_NAMESPACE}:handlers:workOrders:doCompleteWorkOrderMilestone`);
export default async function handler(request, response) {
    let database;
    try {
        database = getDatabaseConnection();
        const success = completeWorkOrderMilestone({
            workOrderMilestoneId: request.body.workOrderMilestoneId
        }, request.session.user, database);
        if (!success) {
            response.status(400).json({
                errorMessage: 'Failed to complete work order milestone',
                success: false
            });
            return;
        }
        const workOrderMilestones = await getWorkOrderMilestones({
            workOrderId: request.body.workOrderId
        }, {
            orderBy: 'completion'
        }, database);
        response.json({
            success,
            workOrderMilestones
        });
    }
    catch (error) {
        debug(JSON.stringify(error, undefined, 2));
        response
            .status(500)
            .json({ errorMessage: 'Database error', success: false });
    }
    finally {
        database?.close();
    }
}

import sqlite from 'better-sqlite3';
import Debug from 'debug';
import addWorkOrderMilestone from '../../database/addWorkOrderMilestone.js';
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:workOrders:doAddWorkOrderMilestone`);
export default async function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const workOrderMilestoneId = addWorkOrderMilestone(request.body, request.session.user);
        const workOrderMilestones = await getWorkOrderMilestones({
            workOrderId: request.body.workOrderId
        }, {
            orderBy: 'completion'
        });
        response.json({
            success: true,
            workOrderMilestoneId,
            workOrderMilestones
        });
    }
    catch (error) {
        debug(error);
        response
            .status(500)
            .json({ errorMessage: 'Database error', success: false });
    }
    finally {
        database?.close();
    }
}

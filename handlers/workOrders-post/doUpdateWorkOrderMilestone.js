import sqlite from 'better-sqlite3';
import Debug from 'debug';
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js';
import updateWorkOrderMilestone from '../../database/updateWorkOrderMilestone.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:workOrders:doUpdateWorkOrderMilestone`);
export default async function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = updateWorkOrderMilestone(request.body, request.session.user, database);
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
        debug(error);
        response
            .status(500)
            .json({ errorMessage: 'Database error', success: false });
    }
    finally {
        database?.close();
    }
}

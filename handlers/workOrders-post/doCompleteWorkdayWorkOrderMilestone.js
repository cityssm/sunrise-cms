import sqlite from 'better-sqlite3';
import Debug from 'debug';
import completeWorkOrderMilestone from '../../database/completeWorkOrderMilestone.js';
import getWorkOrders from '../../database/getWorkOrders.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:workOrders:doCompleteWorkdayWorkOrderMilestone`);
export default async function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
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
        const result = await getWorkOrders({
            workOrderMilestoneDateString: request.body.workdayDateString
        }, {
            limit: -1,
            offset: 0,
            includeBurialSites: true,
            includeMilestones: true
        }, database);
        response.json({
            success,
            workOrders: result.workOrders
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

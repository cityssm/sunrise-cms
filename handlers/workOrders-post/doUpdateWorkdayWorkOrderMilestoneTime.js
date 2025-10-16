import sqlite from 'better-sqlite3';
import Debug from 'debug';
import getWorkOrders from '../../database/getWorkOrders.js';
import { updateWorkOrderMilestoneTime } from '../../database/updateWorkOrderMilestoneTime.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:workOrders:doUpdateWorkdayWorkOrderMilestoneTime`);
export default async function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = updateWorkOrderMilestoneTime(request.body, request.session.user, database);
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

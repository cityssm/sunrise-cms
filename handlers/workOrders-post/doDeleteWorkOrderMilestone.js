import sqlite from 'better-sqlite3';
import Debug from 'debug';
import { deleteRecord } from '../../database/deleteRecord.js';
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:workOrders:doDeleteWorkOrderMilestone`);
export default async function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = deleteRecord('WorkOrderMilestones', request.body.workOrderMilestoneId, request.session.user, database);
        if (!success) {
            response.status(400).json({
                errorMessage: 'Failed to delete work order milestone',
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
        debug(error);
        response
            .status(500)
            .json({ errorMessage: 'Database error', success: false });
    }
    finally {
        database?.close();
    }
}

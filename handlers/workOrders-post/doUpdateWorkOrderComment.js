import sqlite from 'better-sqlite3';
import Debug from 'debug';
import getWorkOrderComments from '../../database/getWorkOrderComments.js';
import updateWorkOrderComment from '../../database/updateWorkOrderComment.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:workOrders:doUpdateWorkOrderComment`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = updateWorkOrderComment(request.body, request.session.user, database);
        const workOrderComments = getWorkOrderComments(request.body.workOrderId, database);
        response.json({
            success,
            workOrderComments
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

import sqlite from 'better-sqlite3';
import Debug from 'debug';
import addWorkOrderComment from '../../database/addWorkOrderComment.js';
import getWorkOrderComments from '../../database/getWorkOrderComments.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:workOrders:doAddWorkOrderComment`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        addWorkOrderComment(request.body, request.session.user, database);
        const workOrderComments = getWorkOrderComments(request.body.workOrderId, database);
        response.json({
            success: true,
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

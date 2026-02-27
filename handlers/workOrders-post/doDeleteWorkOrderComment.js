import sqlite from 'better-sqlite3';
import Debug from 'debug';
import { deleteRecord } from '../../database/deleteRecord.js';
import getWorkOrderComments from '../../database/getWorkOrderComments.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:workOrders:doDeleteWorkOrderComment`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = deleteRecord('WorkOrderComments', request.body.workOrderCommentId, request.session.user, database);
        const workOrderComments = getWorkOrderComments(request.body.workOrderId, database);
        response.json({
            success,
            workOrderComments,
            errorMessage: success ? '' : 'Failed to delete comment'
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

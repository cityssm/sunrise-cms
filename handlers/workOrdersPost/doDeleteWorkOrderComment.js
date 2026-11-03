import { debuglog } from 'node:util';
import { deleteRecord } from '../../database/deleteRecord.js';
import getWorkOrderComments from '../../database/getWorkOrderComments.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getDatabaseConnection } from '../../helpers/database.helpers.js';
const debug = debuglog(`${DEBUG_NAMESPACE}:handlers:workOrders:doDeleteWorkOrderComment`);
export default function handler(request, response) {
    let database;
    try {
        database = getDatabaseConnection();
        const success = deleteRecord('WorkOrderComments', request.body.workOrderCommentId, request.session.user, database);
        if (!success) {
            response
                .status(400)
                .json({ errorMessage: 'Comment not found', success: false });
            return;
        }
        const workOrderComments = getWorkOrderComments(request.body.workOrderId, database);
        response.json({
            success,
            workOrderComments
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

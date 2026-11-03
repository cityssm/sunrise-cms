import { debuglog } from 'node:util';
import addWorkOrderComment from '../../database/addWorkOrderComment.js';
import getWorkOrderComments from '../../database/getWorkOrderComments.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getDatabaseConnection } from '../../helpers/database.helpers.js';
const debug = debuglog(`${DEBUG_NAMESPACE}:handlers:workOrders:doAddWorkOrderComment`);
export default function handler(request, response) {
    let database;
    try {
        database = getDatabaseConnection();
        addWorkOrderComment(request.body, request.session.user, database);
        const workOrderComments = getWorkOrderComments(request.body.workOrderId, database);
        response.json({
            success: true,
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

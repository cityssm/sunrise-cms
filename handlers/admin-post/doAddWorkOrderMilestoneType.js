import sqlite from 'better-sqlite3';
import Debug from 'debug';
import { addWorkOrderMilestoneType } from '../../database/addRecord.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doAddWorkOrderMilestoneType`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const workOrderMilestoneTypeId = addWorkOrderMilestoneType(request.body.workOrderMilestoneType, request.body.orderNumber ?? -1, request.session.user, database);
        const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes();
        response.json({
            success: true,
            workOrderMilestoneTypeId,
            workOrderMilestoneTypes
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

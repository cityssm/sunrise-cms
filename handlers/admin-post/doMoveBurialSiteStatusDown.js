import sqlite from 'better-sqlite3';
import Debug from 'debug';
import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:admin:doMoveBurialSiteStatusDown`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = request.body.moveToEnd === '1'
            ? moveRecordDownToBottom('BurialSiteStatuses', request.body.burialSiteStatusId, database)
            : moveRecordDown('BurialSiteStatuses', request.body.burialSiteStatusId, database);
        const burialSiteStatuses = getCachedBurialSiteStatuses();
        response.json({
            success,
            burialSiteStatuses
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

import sqlite from 'better-sqlite3';
import Debug from 'debug';
import deleteWorkOrderBurialSite from '../../database/deleteWorkOrderBurialSite.js';
import getBurialSites from '../../database/getBurialSites.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:workOrders:doDeleteWorkOrderBurialSite`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = deleteWorkOrderBurialSite(request.body.workOrderId, request.body.burialSiteId, request.session.user, database);
        if (!success) {
            response
                .status(400)
                .json({
                errorMessage: 'Burial site not found in work order',
                success: false
            });
            return;
        }
        const results = getBurialSites({
            workOrderId: request.body.workOrderId
        }, {
            limit: -1,
            offset: 0,
            includeContractCount: false
        }, database);
        response.json({
            success,
            workOrderBurialSites: results.burialSites
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

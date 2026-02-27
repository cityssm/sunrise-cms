import sqlite from 'better-sqlite3';
import Debug from 'debug';
import addWorkOrderBurialSite from '../../database/addWorkOrderBurialSite.js';
import getBurialSites from '../../database/getBurialSites.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:workOrders:doAddWorkOrderBurialSite`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = addWorkOrderBurialSite({
            burialSiteId: request.body.burialSiteId,
            workOrderId: request.body.workOrderId
        }, request.session.user, database);
        const results = getBurialSites({
            workOrderId: request.body.workOrderId
        }, {
            limit: -1,
            offset: 0,
            includeContractCount: false
        }, database);
        response.json({
            success,
            workOrderBurialSites: results.burialSites,
            errorMessage: success ? '' : 'Failed to add burial site to work order'
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

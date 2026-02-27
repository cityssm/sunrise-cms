import sqlite from 'better-sqlite3';
import Debug from 'debug';
import getBurialSites from '../../database/getBurialSites.js';
import { updateBurialSiteStatus } from '../../database/updateBurialSite.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { sunriseDB } from '../../helpers/database.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:handlers:workOrders:doUpdateBurialSiteStatus`);
export default function handler(request, response) {
    let database;
    try {
        database = sqlite(sunriseDB);
        const success = updateBurialSiteStatus(request.body.burialSiteId, request.body.burialSiteStatusId, request.session.user, database);
        if (!success) {
            response
                .status(400)
                .json({
                errorMessage: 'Failed to update burial site status',
                success: false
            });
            return;
        }
        const results = getBurialSites({
            workOrderId: request.body.workOrderId
        }, {
            limit: -1,
            offset: 0,
            includeContractCount: true
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

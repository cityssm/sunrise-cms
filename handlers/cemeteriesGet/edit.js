import { debuglog } from 'node:util';
import getBurialSiteStatusSummary from '../../database/getBurialSiteStatusSummary.js';
import getBurialSiteTypeSummary from '../../database/getBurialSiteTypeSummary.js';
import getCemetery from '../../database/getCemetery.js';
import getWorkOrders from '../../database/getWorkOrders.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getCachedCemeteries } from '../../helpers/cache/cemeteries.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getDatabaseConnection } from '../../helpers/database.helpers.js';
import { getCemeterySvgs } from '../../helpers/images.helpers.js';
const debug = debuglog(`${DEBUG_NAMESPACE}:handlers:cemeteries:edit`);
export default async function handler(request, response) {
    let database;
    try {
        database = getDatabaseConnection();
        const cemetery = getCemetery(request.params.cemeteryId, database);
        if (cemetery === undefined) {
            response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/cemeteries/?error=cemeteryIdNotFound`);
            return;
        }
        const cemeteries = getCachedCemeteries();
        const cemeterySvgs = await getCemeterySvgs();
        const burialSiteTypeSummary = getBurialSiteTypeSummary({
            cemeteryId: cemetery.cemeteryId
        }, database);
        const burialSiteStatusSummary = getBurialSiteStatusSummary({
            cemeteryId: cemetery.cemeteryId
        }, database);
        const relatedOpenWorkOrders = await getWorkOrders({
            cemeteryId: cemetery.cemeteryId,
            workOrderOpenStatus: 'open'
        }, {
            limit: -1,
            offset: 0,
            includeBurialSites: true,
            includeComments: false,
            includeMilestones: true
        }, database);
        response.render('cemeteries/edit', {
            headTitle: cemetery.cemeteryName,
            cemetery,
            cemeterySvgs,
            isCreate: false,
            burialSiteStatusSummary,
            burialSiteTypeSummary,
            cemeteries,
            relatedOpenWorkOrders: relatedOpenWorkOrders.workOrders
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

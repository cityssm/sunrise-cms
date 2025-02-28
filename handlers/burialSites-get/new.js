import getCemeteries from '../../database/getCemeteries.js';
import { getBurialSiteStatuses, getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const burialSite = {
        burialSiteId: -1,
        contracts: []
    };
    const cemeteries = await getCemeteries();
    if (request.query.cemeteryId !== undefined) {
        const cemeteryId = Number.parseInt(request.query.cemeteryId, 10);
        const cemetery = cemeteries.find((possibleMatch) => cemeteryId === possibleMatch.cemeteryId);
        if (cemetery !== undefined) {
            burialSite.cemeteryId = cemetery.cemeteryId;
            burialSite.cemeteryName = cemetery.cemeteryName;
        }
    }
    const burialSiteTypes = await getBurialSiteTypes();
    const burialSiteStatuses = await getBurialSiteStatuses();
    response.render('burialSite-edit', {
        headTitle: 'Create a New Burial Site',
        burialSite,
        isCreate: true,
        cemeteries,
        burialSiteTypes,
        burialSiteStatuses
    });
}

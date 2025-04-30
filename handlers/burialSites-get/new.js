import getCemeteries from '../../database/getCemeteries.js';
import { getBurialSiteStatuses, getBurialSiteTypes } from '../../helpers/functions.cache.js';
import { getBurialSiteImages } from '../../helpers/images.helpers.js';
export default async function handler(request, response) {
    const burialSite = {
        burialSiteId: -1,
        contracts: [],
        // eslint-disable-next-line unicorn/no-null
        bodyCapacity: null,
        // eslint-disable-next-line unicorn/no-null
        crematedCapacity: null
    };
    const cemeteries = getCemeteries();
    if (request.query.cemeteryId !== undefined) {
        const cemeteryId = Number.parseInt(request.query.cemeteryId, 10);
        const cemetery = cemeteries.find((possibleMatch) => cemeteryId === possibleMatch.cemeteryId);
        if (cemetery !== undefined) {
            burialSite.cemeteryId = cemetery.cemeteryId;
            burialSite.cemeteryName = cemetery.cemeteryName;
        }
    }
    const burialSiteImages = await getBurialSiteImages();
    const burialSiteTypes = getBurialSiteTypes();
    const burialSiteStatuses = getBurialSiteStatuses();
    response.render('burialSite-edit', {
        headTitle: 'Create a New Burial Site',
        burialSite,
        isCreate: true,
        burialSiteImages,
        burialSiteStatuses,
        burialSiteTypes,
        cemeteries
    });
}

import getMaps from '../../database/getMaps.js';
import { getLotStatuses, getBurialSiteTypes } from '../../helpers/functions.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const maps = await getMaps();
    const lotTypes = await getBurialSiteTypes();
    const lotStatuses = await getLotStatuses();
    response.render('lot-search', {
        headTitle: `${getConfigProperty('aliases.lot')} Search`,
        maps,
        lotTypes,
        lotStatuses,
        cemeteryId: request.query.cemeteryId,
        burialSiteTypeId: request.query.burialSiteTypeId,
        burialSiteStatusId: request.query.burialSiteStatusId
    });
}

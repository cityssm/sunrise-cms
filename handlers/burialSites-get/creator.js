import getCemeteries from '../../database/getCemeteries.js';
import { getBurialSiteStatuses, getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const cemeteries = getCemeteries();
    const burialSiteTypes = getBurialSiteTypes();
    const burialSiteStatuses = getBurialSiteStatuses();
    response.render('burialSite-creator', {
        headTitle: 'Burial Site Creator',
        burialSiteStatuses,
        burialSiteTypes,
        cemeteries
    });
}

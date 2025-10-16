import { dateToString } from '@cityssm/utils-datetime';
import getCemeteries from '../../database/getCemeteries.js';
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
export default function handler(request, response) {
    const rightNow = new Date();
    const reportTab = request.query.tab ?? 'workOrders';
    const cemeteries = getCemeteries();
    const burialSiteTypes = getCachedBurialSiteTypes();
    const burialSiteStatuses = getCachedBurialSiteStatuses();
    response.render('report-search', {
        headTitle: 'Reports',
        reportTab,
        burialSiteStatuses,
        burialSiteTypes,
        cemeteries,
        todayDateString: dateToString(rightNow)
    });
}

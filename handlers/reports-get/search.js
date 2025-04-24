import { dateToString } from '@cityssm/utils-datetime';
import getCemeteries from '../../database/getCemeteries.js';
import { getBurialSiteStatuses, getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const rightNow = new Date();
    const reportTab = request.query.tab ?? 'workOrders';
    const cemeteries = getCemeteries();
    const burialSiteTypes = getBurialSiteTypes();
    const burialSiteStatuses = getBurialSiteStatuses();
    response.render('report-search', {
        headTitle: 'Reports',
        reportTab,
        burialSiteStatuses,
        burialSiteTypes,
        cemeteries,
        todayDateString: dateToString(rightNow)
    });
}

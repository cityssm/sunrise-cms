import { dateToString } from '@cityssm/utils-datetime';
import { getCachedCemeteries } from '../../helpers/cache/cemeteries.cache.js';
import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(request, response) {
    const cemeteries = getCachedCemeteries();
    response.render('workOrders/workday', {
        headTitle: i18next.t('workOrders.workdayReport', {
            lng: response.locals.lng
        }),
        cemeteries,
        workdayDateString: request.query.workdayDateString ?? dateToString(new Date())
    });
}

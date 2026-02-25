import { getApplicationUrl } from '../../helpers/application.helpers.js';
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js';
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js';
import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(request, response) {
    const workOrderTypes = getCachedWorkOrderTypes();
    const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes();
    const applicationUrl = getApplicationUrl(request);
    response.render('workOrders/ical', {
        headTitle: i18next.t('workOrders:icalIntegration', { lng: response.locals.lng }),
        workOrderMilestoneTypes,
        workOrderTypes,
        applicationUrl
    });
}

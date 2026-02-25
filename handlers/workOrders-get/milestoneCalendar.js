import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(request, response) {
    response.render('workOrders/milestoneCalendar', {
        headTitle: i18next.t('workOrders:milestoneCalendar', { lng: response.locals.lng })
    });
}

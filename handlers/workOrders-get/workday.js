import { dateToString } from '@cityssm/utils-datetime';
import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(request, response) {
    response.render('workOrders/workday', {
        headTitle: i18next.t('workOrders:workdayReport', { lng: response.locals.lng }),
        workdayDateString: request.query.workdayDateString ?? dateToString(new Date())
    });
}

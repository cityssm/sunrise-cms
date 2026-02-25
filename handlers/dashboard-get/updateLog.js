import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(_request, response) {
    response.render('dashboard/updateLog', {
        headTitle: i18next.t('dashboard:updateLog', { lng: response.locals.lng })
    });
}

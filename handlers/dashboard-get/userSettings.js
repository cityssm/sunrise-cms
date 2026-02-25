import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(_request, response) {
    response.render('dashboard/userSettings', {
        headTitle: i18next.t('dashboard:userSettings', { lng: response.locals.lng })
    });
}

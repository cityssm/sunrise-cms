import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(_request, response) {
    response.render('admin/auditLog', {
        headTitle: i18next.t('admin:auditLog', { lng: response.locals.lng })
    });
}

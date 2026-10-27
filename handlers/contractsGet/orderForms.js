import { getUnprocessedOrderFormCount } from '../../database/getOrderForms.js';
import { getCachedSetting } from '../../helpers/cache/settings.cache.js';
import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(request, response) {
    const syncError = getCachedSetting('integrations.portal.syncError');
    const unprocessedOrderFormCount = getUnprocessedOrderFormCount();
    response.render('contracts/orderForms', {
        headTitle: i18next.t('contracts.orderForms', {
            lng: response.locals.lng
        }),
        unprocessedOrderFormCount,
        syncError
    });
}

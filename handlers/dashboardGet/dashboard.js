import { dateToString } from '@cityssm/utils-datetime';
import getContracts from '../../database/getContracts.js';
import { getUnprocessedOrderFormCount } from '../../database/getOrderForms.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { i18next } from '../../helpers/i18n.helpers.js';
export default async function handler(request, response) {
    let error = request.query.error;
    if (error === 'accessDenied') {
        error = 'Access Denied.';
    }
    else if (error === 'printConfigNotFound') {
        error = 'Print configuration not found.';
    }
    const contracts = await getContracts({
        funeralDateString: dateToString(new Date())
    }, {
        limit: -1,
        offset: 0
    });
    const unprocessedOrderFormCount = getConfigProperty('integrations.portal.integrationIsEnabled')
        ? getUnprocessedOrderFormCount()
        : 0;
    response.render('dashboard/dashboard', {
        headTitle: i18next.t('dashboard.title', { lng: response.locals.lng }),
        error,
        contracts: contracts.contracts,
        unprocessedOrderFormCount
    });
}

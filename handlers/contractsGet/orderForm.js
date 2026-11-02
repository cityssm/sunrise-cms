import getOrderForm, { getOrderFormMismatches } from '../../database/getOrderForm.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { i18next } from '../../helpers/i18n.helpers.js';
import { canUserUpdateContracts } from '../../helpers/user.helpers.js';
export default async function handler(request, response) {
    const orderForm = await getOrderForm(request.params.orderFormId);
    if (orderForm === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/contracts/orderForms/?error=orderFormNotFound`);
        return;
    }
    response.render('contracts/orderForm', {
        headTitle: i18next.t('contracts.orderFormTitle', {
            id: orderForm.orderFormId,
            lng: response.locals.lng
        }),
        canUpdateContracts: canUserUpdateContracts(request),
        orderForm,
        mismatches: getOrderFormMismatches(orderForm)
    });
}

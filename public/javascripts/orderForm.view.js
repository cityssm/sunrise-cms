{
    const sunrise = exports.sunrise;
    const orderFormId = document.querySelector('#orderForm--orderFormId')?.value;
    if (orderFormId === undefined || orderFormId === '') {
        throw new Error('Order form id not found.');
    }
    function doProcess() {
        cityssm.postJSON(`${sunrise.urlPrefix}/contracts/orderForms/${orderFormId}/doProcessOrderForm`, {}, (responseJSON) => {
            if (responseJSON.success) {
                globalThis.location.reload();
                return;
            }
            bulmaJS.alert({
                contextualColorName: 'danger',
                title: i18next.t('error'),
                message: responseJSON.errorMessage
            });
        });
    }
    function doDelete() {
        cityssm.postJSON(`${sunrise.urlPrefix}/contracts/orderForms/${orderFormId}/doDeleteOrderForm`, {}, (responseJSON) => {
            if (responseJSON.success) {
                globalThis.location.assign(`${sunrise.urlPrefix}/contracts/orderForms`);
                return;
            }
            bulmaJS.alert({
                contextualColorName: 'danger',
                title: i18next.t('error'),
                message: responseJSON.errorMessage
            });
        });
    }
    document
        .querySelector('#button--processOrderForm')
        ?.addEventListener('click', () => {
        bulmaJS.confirm({
            contextualColorName: 'info',
            title: i18next.t('contracts.orderFormsProcess'),
            message: i18next.t('contracts.processOrderFormWarning'),
            okButton: {
                callbackFunction: () => {
                    globalThis.location.assign(`${sunrise.urlPrefix}/contracts/new?orderFormId=${encodeURIComponent(orderFormId)}`);
                },
                text: i18next.t('contracts.processOrderFormInNewContract')
            },
            cancelButton: {
                callbackFunction: doProcess,
                text: i18next.t('contracts.processOrderFormAsProcessed')
            }
        });
    });
    document
        .querySelector('#button--deleteOrderForm')
        ?.addEventListener('click', () => {
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: i18next.t('contracts.orderFormsDelete'),
            message: i18next.t('contracts.deleteConfirmation'),
            okButton: {
                callbackFunction: doDelete,
                text: i18next.t('delete')
            }
        });
    });
}

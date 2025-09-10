"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    document
        .querySelector('#button--reopenWorkOrder')
        ?.addEventListener('click', (clickEvent) => {
        const workOrderId = clickEvent.currentTarget.dataset.workOrderId ??
            '';
        function doReopen() {
            cityssm.postJSON(`${sunrise.urlPrefix}/workOrders/doReopenWorkOrder`, {
                workOrderId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    globalThis.location.href = sunrise.getWorkOrderUrl(workOrderId, true, true);
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Reopening Work Order',
                        message: responseJSON.errorMessage ?? '',
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Reopen Work Order',
            message: 'Are you sure you want to remove the close date from this work order and reopen it?',
            okButton: {
                callbackFunction: doReopen,
                text: 'Yes, Reopen Work Order'
            }
        });
    });
})();

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
                    globalThis.location.href = sunrise.getWorkOrderURL(workOrderId, true, true);
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Reopening Work Order',
                        message: responseJSON.errorMessage ?? '',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Reopen Work Order',
            message: 'Are you sure you want to remove the close date from this work order and reopen it?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Reopen Work Order',
                callbackFunction: doReopen
            }
        });
    });
})();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const los = exports.sunrise;
    const reopenWorkOrderButtonElement = document.querySelector('#button--reopenWorkOrder');
    if (reopenWorkOrderButtonElement !== null) {
        const workOrderId = reopenWorkOrderButtonElement.dataset.workOrderId ?? '';
        reopenWorkOrderButtonElement.addEventListener('click', () => {
            function doReopen() {
                cityssm.postJSON(`${los.urlPrefix}/workOrders/doReopenWorkOrder`, {
                    workOrderId
                }, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        globalThis.location.href = los.getWorkOrderURL(workOrderId, true, true);
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
    }
})();

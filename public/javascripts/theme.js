(() => {
    function doLogout() {
        const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? '';
        globalThis.localStorage.clear();
        globalThis.location.href = `${urlPrefix}/logout`;
    }
    document
        .querySelector('#cityssm-theme--logout-button')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: i18next.t('login:logout'),
            message: i18next.t('login:logoutConfirm'),
            okButton: {
                callbackFunction: doLogout,
                text: i18next.t('login:logout')
            }
        });
    });
})();
(() => {
    const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? '';
    const keepAliveMillis = document.querySelector('main')?.dataset.sessionKeepAliveMillis;
    let keepAliveInterval;
    function doKeepAlive() {
        cityssm.postJSON(`${urlPrefix}/keepAlive`, {
            t: Date.now()
        }, (rawResponseJson) => {
            const responseJson = rawResponseJson;
            if (!responseJson.activeSession) {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Session Expired',
                    message: 'Your session has expired. Please log in again.',
                    okButton: {
                        callbackFunction: () => {
                            globalThis.location.reload();
                        },
                        text: 'Refresh Page'
                    }
                });
                globalThis.clearInterval(keepAliveInterval);
            }
        });
    }
    if (keepAliveMillis !== undefined && keepAliveMillis !== '0') {
        keepAliveInterval = globalThis.setInterval(doKeepAlive, Number.parseInt(keepAliveMillis, 10));
    }
})();
(() => {
    const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? '';
    function doContractQuickSearch(formEvent) {
        formEvent.preventDefault();
        const contractField = document.querySelector('#quickSearchContract--searchField').value;
        const searchValue = document.querySelector('#quickSearchContract--searchValue').value;
        if (contractField === 'deceasedName') {
            globalThis.location.href = `${urlPrefix}/contracts/?deceasedName=${encodeURIComponent(searchValue)}`;
        }
        else if (contractField === 'contractNumber') {
            globalThis.location.href = `${urlPrefix}/contracts/?contractNumber=${encodeURIComponent(searchValue)}`;
        }
        else {
            bulmaJS.alert({
                contextualColorName: 'danger',
                title: 'Invalid Search',
                message: 'Please enter a valid search value.'
            });
        }
    }
    function doWorkOrderQuickSearch(formEvent) {
        formEvent.preventDefault();
        const workOrderNumber = document.querySelector('#quickSearchWorkOrder--workOrderNumber').value;
        globalThis.location.href = `${urlPrefix}/workOrders/byWorkOrderNumber/${encodeURIComponent(workOrderNumber)}`;
    }
    document
        .querySelector('#navbar--quickSearch')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        cityssm.openHtmlModal('quickSearch', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('#quickSearch--contractsLink').href = `${urlPrefix}/contracts`;
                modalElement.querySelector('#quickSearch--workOrdersLink').href = `${urlPrefix}/workOrders`;
            },
            onshown(modalElement) {
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('input')?.focus();
                modalElement
                    .querySelector('#form--quickSearchContract')
                    ?.addEventListener('submit', doContractQuickSearch);
                modalElement
                    .querySelector('#form--quickSearchWorkOrder')
                    ?.addEventListener('submit', doWorkOrderQuickSearch);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
})();
(() => {
    for (const selectElement of document.querySelectorAll('select[data-value]')) {
        const dataValue = selectElement.dataset.value;
        if (dataValue !== undefined) {
            for (const optionElement of selectElement.options) {
                if (optionElement.value === dataValue) {
                    optionElement.selected = true;
                    break;
                }
            }
        }
    }
    for (const optionElement of document.querySelectorAll('option[data-selected]')) {
        const dataSelected = optionElement.dataset.selected;
        if (dataSelected === 'true' || dataSelected === 'selected') {
            optionElement.selected = true;
        }
    }
    for (const inputElement of document.querySelectorAll('input[data-pattern]')) {
        const dataPattern = inputElement.dataset.pattern;
        if (dataPattern !== undefined && dataPattern !== '') {
            inputElement.pattern = dataPattern;
        }
    }
    for (const inputElement of document.querySelectorAll('input[data-required="true"], input[data-required="required"]')) {
        inputElement.required = true;
    }
    for (const inputElement of document.querySelectorAll('input[data-autofocus="true"], input[data-autofocus="autofocus"], select[data-autofocus="true"], select[data-autofocus="autofocus"]')) {
        inputElement.autofocus = true;
        inputElement.focus();
    }
    for (const inputElement of document.querySelectorAll('input[data-disabled="true"], input[data-disabled="disabled"], select[data-disabled="true"], select[data-disabled="disabled"], option[data-disabled="true"], option[data-disabled="disabled"]')) {
        inputElement.disabled = true;
    }
    for (const inputElement of document.querySelectorAll('input[data-readonly="true"], input[data-readonly="readonly"]')) {
        inputElement.readOnly = true;
    }
})();

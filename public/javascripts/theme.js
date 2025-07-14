"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            title: 'Log Out?',
            message: 'Are you sure you want to log out?',
            okButton: {
                callbackFunction: doLogout,
                text: 'Log Out'
            }
        });
    });
})();
(() => {
    const urlPrefix = document.querySelector('main')?.getAttribute('data-url-prefix') ?? '';
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
    const urlPrefix = document.querySelector('main')?.getAttribute('data-url-prefix') ?? '';
    function doContractQuickSearch(formEvent) {
        formEvent.preventDefault();
        const contractIdElement = document.querySelector('#quickSearchContract--contractId');
        globalThis.location.href = `${urlPrefix}/contracts/${encodeURIComponent(contractIdElement.value)}`;
    }
    document
        .querySelector('#navbar--quickSearch')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        cityssm.openHtmlModal('quickSearch', {
            onshown(modalElement) {
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('input')?.focus();
                modalElement.querySelector('#form--quickSearchContract')?.addEventListener('submit', doContractQuickSearch);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            },
        });
    });
})();

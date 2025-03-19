"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    function doLogout() {
        const urlPrefix = document.querySelector('main')?.getAttribute('data-url-prefix') ?? '';
        globalThis.localStorage.clear();
        globalThis.location.href = urlPrefix + '/logout';
    }
    document
        .querySelector('#cityssm-theme--logout-button')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        bulmaJS.confirm({
            title: 'Log Out?',
            message: 'Are you sure you want to log out?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Log Out',
                callbackFunction: doLogout
            }
        });
    });
})();
(() => {
    const urlPrefix = document.querySelector('main')?.getAttribute('data-url-prefix') ?? '';
    const keepAliveMillis = document
        .querySelector('main')
        ?.getAttribute('data-session-keep-alive-millis');
    function doKeepAlive() {
        cityssm.postJSON(urlPrefix + '/keepAlive', {
            t: Date.now()
        }, () => {
            // Do nothing
        });
    }
    if (keepAliveMillis !== null &&
        keepAliveMillis !== undefined &&
        keepAliveMillis !== '0') {
        globalThis.setInterval(doKeepAlive, Number.parseInt(keepAliveMillis, 10));
    }
})();

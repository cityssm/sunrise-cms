"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    document
        .querySelector('#userSettingsForm--consignoCloud')
        ?.addEventListener('submit', (event) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        cityssm.postJSON(`${sunrise.urlPrefix}/dashboard/doUpdateConsignoCloudUserSettings`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                bulmaJS.alert({
                    message: 'ConsignO Cloud Settings updated successfully.'
                });
                formElement.querySelector(
                // eslint-disable-next-line no-secrets/no-secrets
                'input[name="thirdPartyApplicationPassword"]').value = '';
            }
        });
    });
})();

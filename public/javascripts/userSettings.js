(() => {
    const sunrise = exports.sunrise;
    /*
     * ConsignO Cloud
     */
    document
        .querySelector('#userSettingsForm--consignoCloud')
        ?.addEventListener('submit', (event) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        cityssm.postJSON(`${sunrise.urlPrefix}/dashboard/doUpdateConsignoCloudUserSettings`, formElement, (responseJSON) => {
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
    /*
     * API Key
     */
    function doResetApiKey() {
        cityssm.postJSON(`${sunrise.urlPrefix}/dashboard/doResetApiKey`, {}, (responseJSON) => {
            if (responseJSON.success) {
                bulmaJS.alert({
                    contextualColorName: 'success',
                    title: 'API Key Reset Successfully',
                    message: 'Remember to update any applications using your API key.'
                });
            }
        });
    }
    document
        .querySelector('#button--resetApiKey')
        ?.addEventListener('click', (event) => {
        event.preventDefault();
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Reset API Key',
            message: 'Are you sure you want to reset your API key?',
            okButton: {
                callbackFunction: doResetApiKey,
                text: 'Yes, Reset My API Key'
            }
        });
    });
})();

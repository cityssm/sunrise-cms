{
    const sunrise = exports.sunrise;
    const statHolidaySettingsFormElement = document.querySelector('#form--statHolidaySettings');
    statHolidaySettingsFormElement.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateStatHolidays`, statHolidaySettingsFormElement, (responseJSON) => {
            if (responseJSON.success) {
                globalThis.location.reload();
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Unable to Save',
                    message: 'There was an error saving the stat holiday settings.'
                });
            }
        });
    });
    const actionFormElements = document.querySelectorAll('.statHolidayActionForm');
    for (const actionFormElement of actionFormElements) {
        actionFormElement.addEventListener('submit', (formEvent) => {
            formEvent.preventDefault();
            const formElement = formEvent.currentTarget;
            const requestUrl = formElement.dataset.url;
            if (requestUrl === undefined) {
                return;
            }
            cityssm.postJSON(requestUrl, formElement, (responseJSON) => {
                if (responseJSON.success) {
                    globalThis.location.reload();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Unable to Save',
                        message: 'There was an error saving the stat holiday settings.'
                    });
                }
            });
        });
    }
}

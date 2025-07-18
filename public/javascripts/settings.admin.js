"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    function highlightChangedSettings(changeEvent) {
        const inputElement = changeEvent.currentTarget;
        inputElement.classList.add('has-background-warning-light');
    }
    function updateSetting(formEvent) {
        formEvent.preventDefault();
        const formElement = formEvent.currentTarget;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateSetting`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                bulmaJS.alert({
                    contextualColorName: 'success',
                    title: 'Setting Updated',
                    message: 'The setting has been successfully updated.'
                });
                formElement
                    .querySelector('.input, select')
                    ?.classList.remove('has-background-warning-light');
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Update Failed',
                    message: responseJSON.errorMessage ??
                        'There was an error updating the setting.'
                });
            }
        });
    }
    const settingFormElements = document.querySelectorAll('.settingForm');
    for (const settingFormElement of settingFormElements) {
        settingFormElement.addEventListener('submit', updateSetting);
        settingFormElement
            .querySelector('.input, select')
            ?.addEventListener('change', highlightChangedSettings);
    }
})();

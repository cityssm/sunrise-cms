(() => {
    const sunrise = exports.sunrise;
    /*
     * Filter Settings
     */
    const settingsFilterElement = document.querySelector('#settingsFilter');
    const settingsTableBodyElement = document.querySelector('#settingsTableBody');
    function applySettingsFilter() {
        const filterValue = settingsFilterElement.value.toLowerCase();
        for (const rowElement of settingsTableBodyElement.querySelectorAll('tr')) {
            const searchString = rowElement.dataset.searchString ?? '';
            rowElement.classList.toggle('is-hidden', !searchString.includes(filterValue));
        }
    }
    settingsFilterElement.addEventListener('input', applySettingsFilter);
    applySettingsFilter();
    /*
     * Update Settings
     */
    function highlightChangedSettings(changeEvent) {
        const inputElement = changeEvent.currentTarget;
        inputElement.classList.add('has-background-warning-light');
    }
    function updateSetting(formEvent) {
        formEvent.preventDefault();
        const formElement = formEvent.currentTarget;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateSetting`, formElement, (responseJSON) => {
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
                    message: 'There was an error updating the setting.'
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

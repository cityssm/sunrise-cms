{
    const sunrise = exports.sunrise;
    const statHolidaySettingsFormElement = document.querySelector('#form--statHolidaySettings');
    const countrySelectElement = statHolidaySettingsFormElement.querySelector('#country');
    const stateSelectElement = statHolidaySettingsFormElement.querySelector('#state');
    const regionSelectElement = statHolidaySettingsFormElement.querySelector('#region');
    function updateSelectOptions(selectElement, options, selectedValue = '') {
        selectElement.innerHTML = '';
        selectElement.add(new Option('(None)', ''));
        for (const [optionValue, optionLabel] of Object.entries(options)) {
            selectElement.add(new Option(`${optionLabel} (${optionValue})`, optionValue));
        }
        selectElement.value =
            options[selectedValue] === undefined ? '' : selectedValue;
    }
    function refreshLocationOptions(refreshMode) {
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doGetStatHolidayLocationOptions`, {
            country: countrySelectElement.value,
            state: stateSelectElement.value
        }, (responseJSON) => {
            if (!responseJSON.success) {
                return;
            }
            const selectedState = refreshMode === 'country' ? '' : stateSelectElement.value;
            updateSelectOptions(stateSelectElement, responseJSON.states, selectedState);
            const selectedRegion = refreshMode === 'country' || refreshMode === 'state'
                ? ''
                : regionSelectElement.value;
            updateSelectOptions(regionSelectElement, responseJSON.regions, selectedRegion);
        });
    }
    countrySelectElement.addEventListener('change', () => {
        stateSelectElement.value = '';
        refreshLocationOptions('country');
    });
    stateSelectElement.addEventListener('change', () => {
        regionSelectElement.value = '';
        refreshLocationOptions('state');
    });
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

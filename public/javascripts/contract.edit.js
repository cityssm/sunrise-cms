(() => {
    const sunrise = exports.sunrise;
    const contractId = document.querySelector('#contract--contractId').value;
    const isCreate = contractId === '';
    let refreshAfterSave = isCreate;
    function setUnsavedChanges() {
        sunrise.setUnsavedChanges();
        document
            .querySelector("button[type='submit'][form='form--contract']")
            ?.classList.remove('is-light');
    }
    function clearUnsavedChanges() {
        sunrise.clearUnsavedChanges();
        document
            .querySelector("button[type='submit'][form='form--contract']")
            ?.classList.add('is-light');
    }
    const formElement = document.querySelector('#form--contract');
    formElement.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
        cityssm.postJSON(`${sunrise.urlPrefix}/contracts/${isCreate ? 'doCreateContract' : 'doUpdateContract'}`, formElement, (responseJSON) => {
            if (!('success' in responseJSON) || responseJSON.success) {
                clearUnsavedChanges();
                if (isCreate || refreshAfterSave) {
                    globalThis.location.href = sunrise.getContractUrl(responseJSON.contractId, true, true);
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Contract Updated Successfully'
                    });
                }
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: 'Error Saving Contract'
                });
            }
        });
    });
    const formInputElements = formElement.querySelectorAll('input, select');
    for (const formInputElement of formInputElements) {
        formInputElement.addEventListener('change', setUnsavedChanges);
    }
    function doCopy() {
        cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doCopyContract`, {
            contractId
        }, (responseJSON) => {
            clearUnsavedChanges();
            globalThis.location.href = sunrise.getContractUrl(responseJSON.contractId, true);
        });
    }
    document
        .querySelector('#button--copyContract')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        if (sunrise.hasUnsavedChanges()) {
            bulmaJS.alert({
                contextualColorName: 'warning',
                title: 'Unsaved Changes',
                message: 'Please save all unsaved changes before continuing.'
            });
        }
        else {
            bulmaJS.confirm({
                contextualColorName: 'info',
                title: 'Copy Contract Record as New',
                message: 'Are you sure you want to copy this record to a new record?',
                okButton: {
                    callbackFunction: doCopy,
                    text: 'Yes, Copy'
                }
            });
        }
    });
    document
        .querySelector('#button--deleteContract')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doDeleteContract`, {
                contractId
            }, (responseJSON) => {
                if (responseJSON.success) {
                    clearUnsavedChanges();
                    globalThis.location.href = sunrise.getContractUrl();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Deleting Record',
                        message: responseJSON.errorMessage
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Contract Record',
            message: 'Are you sure you want to delete this record?',
            okButton: {
                callbackFunction: doDelete,
                text: 'Yes, Delete'
            }
        });
    });
    const contractTypeIdElement = document.querySelector('#contract--contractTypeId');
    if (isCreate) {
        const contractFieldsContainerElement = document.querySelector('#container--contractFields');
        contractTypeIdElement.addEventListener('change', () => {
            if (contractTypeIdElement.value === '') {
                contractFieldsContainerElement.innerHTML = `
          <div class="message is-info">
            <p class="message-body">Select the contract type to load the available fields.</p>
          </div>
        `;
                return;
            }
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doGetContractTypeFields`, {
                contractTypeId: contractTypeIdElement.value
            }, (responseJSON) => {
                if (responseJSON.contractTypeFields.length === 0) {
                    contractFieldsContainerElement.innerHTML = `
              <div class="message is-info">
                <p class="message-body">There are no additional fields for this contract type.</p>
              </div>
            `;
                    return;
                }
                contractFieldsContainerElement.innerHTML = '';
                let contractTypeFieldIds = '';
                for (const contractTypeField of responseJSON.contractTypeFields) {
                    contractTypeFieldIds += `,${contractTypeField.contractTypeFieldId.toString()}`;
                    const fieldName = `contractFieldValue_${contractTypeField.contractTypeFieldId.toString()}`;
                    const fieldId = `contract--${fieldName}`;
                    const fieldElement = document.createElement('div');
                    fieldElement.className = 'field';
                    fieldElement.innerHTML = `
              <label class="label" for="${cityssm.escapeHTML(fieldId)}"></label>
              <div class="control"></div>
            `;
                    fieldElement.querySelector('label').textContent = contractTypeField.contractTypeField;
                    if (contractTypeField.fieldType === 'select' ||
                        (contractTypeField.fieldValues ?? '') !== '') {
                        ;
                        fieldElement.querySelector('.control').innerHTML = `
                <div class="select is-fullwidth">
                  <select id="${cityssm.escapeHTML(fieldId)}" name="${cityssm.escapeHTML(fieldName)}">
                    <option value="">(Not Set)</option>
                  </select>
                </div>
              `;
                        const selectElement = fieldElement.querySelector('select');
                        selectElement.required = contractTypeField.isRequired;
                        const optionValues = contractTypeField.fieldValues.split('\n');
                        for (const optionValue of optionValues) {
                            const optionElement = document.createElement('option');
                            optionElement.value = optionValue;
                            optionElement.textContent = optionValue;
                            selectElement.append(optionElement);
                        }
                    }
                    else {
                        const inputElement = document.createElement('input');
                        inputElement.className = 'input';
                        inputElement.id = fieldId;
                        inputElement.name = fieldName;
                        inputElement.type = contractTypeField.fieldType;
                        inputElement.required = contractTypeField.isRequired;
                        inputElement.minLength = contractTypeField.minLength;
                        inputElement.maxLength = contractTypeField.maxLength;
                        if ((contractTypeField.pattern ?? '') !== '') {
                            inputElement.pattern = contractTypeField.pattern;
                        }
                        ;
                        fieldElement.querySelector('.control').append(inputElement);
                    }
                    contractFieldsContainerElement.append(fieldElement);
                }
                contractFieldsContainerElement.insertAdjacentHTML('beforeend', `
              <input
                name="contractTypeFieldIds"
                type="hidden"
                value="${cityssm.escapeHTML(contractTypeFieldIds.slice(1))}" />
            `);
            });
        });
    }
    else {
        const originalContractTypeId = contractTypeIdElement.value;
        contractTypeIdElement.addEventListener('change', () => {
            if (contractTypeIdElement.value !== originalContractTypeId) {
                bulmaJS.confirm({
                    contextualColorName: 'warning',
                    title: 'Confirm Change',
                    message: `Are you sure you want to change the contract type?\n
            This change affects the additional fields associated with this record, and may also affect the available fees.`,
                    okButton: {
                        callbackFunction: () => {
                            refreshAfterSave = true;
                        },
                        text: 'Yes, Keep the Change'
                    },
                    cancelButton: {
                        callbackFunction: () => {
                            contractTypeIdElement.value = originalContractTypeId;
                        },
                        text: 'Revert the Change'
                    }
                });
            }
        });
    }
    const burialSiteIdElement = document.querySelector('#contract--burialSiteId');
    const burialSiteNameElement = document.querySelector('#contract--burialSiteName');
    const directionOfArrivalElement = document.querySelector('#contract--directionOfArrival');
    function refreshDirectionsOfArrival() {
        const burialSiteId = burialSiteIdElement.value;
        cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doGetBurialSiteDirectionsOfArrival`, {
            burialSiteId
        }, (responseJSON) => {
            const currentDirectionOfArrival = directionOfArrivalElement.value;
            directionOfArrivalElement.value = '';
            directionOfArrivalElement.innerHTML =
                '<option value="">(No Direction)</option>';
            for (const direction of exports.directionsOfArrival) {
                if (responseJSON.directionsOfArrival[direction] !== undefined) {
                    const optionElement = document.createElement('option');
                    optionElement.value = direction;
                    optionElement.textContent =
                        direction +
                            (responseJSON.directionsOfArrival[direction] === ''
                                ? ''
                                : ` - ${responseJSON.directionsOfArrival[direction]}`);
                    if (currentDirectionOfArrival === direction) {
                        optionElement.selected = true;
                    }
                    directionOfArrivalElement.append(optionElement);
                }
            }
        });
    }
    burialSiteNameElement.addEventListener('click', (clickEvent) => {
        const currentBurialSiteName = clickEvent.currentTarget
            .value;
        let burialSiteSelectCloseModalFunction;
        let burialSiteSelectFormElement;
        let burialSiteSelectResultsElement;
        let burialSiteCreateFormElement;
        function renderSelectedBurialSiteAndClose(burialSiteId, burialSiteName) {
            burialSiteIdElement.value = burialSiteId.toString();
            burialSiteNameElement.value = burialSiteName;
            setUnsavedChanges();
            burialSiteSelectCloseModalFunction();
            refreshDirectionsOfArrival();
        }
        function selectExistingBurialSite(selectClickEvent) {
            selectClickEvent.preventDefault();
            const selectedBurialSiteElement = selectClickEvent.currentTarget;
            renderSelectedBurialSiteAndClose(selectedBurialSiteElement.dataset.burialSiteId ?? '', selectedBurialSiteElement.dataset.burialSiteName ?? '');
        }
        function searchBurialSites() {
            burialSiteSelectResultsElement.innerHTML =
                sunrise.getLoadingParagraphHTML('Searching...');
            cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doSearchBurialSites`, burialSiteSelectFormElement, (responseJSON) => {
                if (responseJSON.count === 0) {
                    burialSiteSelectResultsElement.innerHTML = `
              <div class="message is-info">
                <p class="message-body">No results.</p>
              </div>
            `;
                    return;
                }
                const panelElement = document.createElement('div');
                panelElement.className = 'panel';
                for (const burialSite of responseJSON.burialSites) {
                    const panelBlockElement = document.createElement('a');
                    panelBlockElement.className = 'panel-block is-block';
                    panelBlockElement.href = '#';
                    panelBlockElement.dataset.burialSiteId =
                        burialSite.burialSiteId.toString();
                    panelBlockElement.dataset.burialSiteName = burialSite.burialSiteName;
                    panelBlockElement.innerHTML = `
              <div class="columns">
                <div class="column">
                  ${cityssm.escapeHTML(burialSite.burialSiteName)}<br />
                  <span class="is-size-7">${cityssm.escapeHTML(burialSite.cemeteryName ?? '')}</span>
                </div>
                <div class="column">
                  ${cityssm.escapeHTML(burialSite.burialSiteStatus)}<br />
                  <span class="is-size-7">
                    ${(burialSite.contractCount ?? 0) > 0 ? 'Has Current Contract' : ''}
                  </span>
                </div>
              </div>
            `;
                    panelBlockElement.addEventListener('click', selectExistingBurialSite);
                    panelElement.append(panelBlockElement);
                }
                burialSiteSelectResultsElement.innerHTML = '';
                burialSiteSelectResultsElement.append(panelElement);
            });
        }
        function createBurialSite(createEvent) {
            createEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doCreateBurialSite`, burialSiteCreateFormElement, (responseJSON) => {
                if (responseJSON.success) {
                    setUnsavedChanges();
                    renderSelectedBurialSiteAndClose(responseJSON.burialSiteId, responseJSON.burialSiteName);
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Creating Burial Site',
                        message: responseJSON.errorMessage
                    });
                }
            });
        }
        cityssm.openHtmlModal('contract-selectBurialSite', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                burialSiteSelectCloseModalFunction = closeModalFunction;
                bulmaJS.init(modalElement);
                const burialSiteNameFilterElement = modalElement.querySelector('#burialSiteSelect--burialSiteName');
                if (document.querySelector('#contract--burialSiteId').value !== '') {
                    burialSiteNameFilterElement.value = currentBurialSiteName;
                }
                burialSiteNameFilterElement.focus();
                burialSiteNameFilterElement.addEventListener('change', searchBurialSites);
                const contractStatusFilterElement = modalElement.querySelector('#burialSiteSelect--contractStatus');
                contractStatusFilterElement.addEventListener('change', searchBurialSites);
                if (currentBurialSiteName !== '') {
                    contractStatusFilterElement.value = '';
                }
                burialSiteSelectFormElement = modalElement.querySelector('#form--burialSiteSelect');
                burialSiteSelectResultsElement = modalElement.querySelector('#resultsContainer--burialSiteSelect');
                burialSiteSelectFormElement.addEventListener('submit', (submitEvent) => {
                    submitEvent.preventDefault();
                });
                searchBurialSites();
                const burialSiteNameSegmentsFieldElement = document.querySelector('#template--burialSiteNameSegments > div.field').cloneNode(true);
                burialSiteNameSegmentsFieldElement
                    .querySelector('input[name="burialSiteNameSegment1"]')
                    ?.setAttribute('id', 'burialSiteCreate--burialSiteNameSegment1');
                modalElement
                    .querySelector('label[for="burialSiteCreate--burialSiteNameSegment1"]')
                    ?.insertAdjacentElement('afterend', burialSiteNameSegmentsFieldElement);
                const cemeterySelectElement = modalElement.querySelector('#burialSiteCreate--cemeteryId');
                for (const cemetery of exports.cemeteries) {
                    const optionElement = document.createElement('option');
                    optionElement.value = cemetery.cemeteryId?.toString() ?? '';
                    optionElement.textContent =
                        cemetery.cemeteryName === '' ? '(No Name)' : cemetery.cemeteryName;
                    cemeterySelectElement.append(optionElement);
                }
                const burialSiteTypeSelectElement = modalElement.querySelector('#burialSiteCreate--burialSiteTypeId');
                for (const burialSiteType of exports.burialSiteTypes) {
                    const optionElement = document.createElement('option');
                    optionElement.value = burialSiteType.burialSiteTypeId.toString();
                    optionElement.textContent = burialSiteType.burialSiteType;
                    burialSiteTypeSelectElement.append(optionElement);
                }
                const burialSiteStatusSelectElement = modalElement.querySelector('#burialSiteCreate--burialSiteStatusId');
                for (const burialSiteStatus of exports.burialSiteStatuses) {
                    const optionElement = document.createElement('option');
                    optionElement.value = burialSiteStatus.burialSiteStatusId.toString();
                    optionElement.textContent = burialSiteStatus.burialSiteStatus;
                    burialSiteStatusSelectElement.append(optionElement);
                }
                burialSiteCreateFormElement = modalElement.querySelector('#form--burialSiteCreate');
                burialSiteCreateFormElement.addEventListener('submit', createBurialSite);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    document
        .querySelector('.is-burial-site-view-button')
        ?.addEventListener('click', () => {
        const burialSiteId = document.querySelector('#contract--burialSiteId').value;
        if (burialSiteId === '') {
            bulmaJS.alert({
                contextualColorName: 'info',
                message: 'No burial site selected.'
            });
        }
        else {
            globalThis.open(sunrise.getBurialSiteUrl(burialSiteId));
        }
    });
    document
        .querySelector('.is-clear-burial-site-button')
        ?.addEventListener('click', () => {
        if (burialSiteNameElement.disabled) {
            bulmaJS.alert({
                contextualColorName: 'info',
                message: 'You need to unlock the field before clearing it.'
            });
        }
        else {
            burialSiteNameElement.value = '(No Burial Site)';
            document.querySelector('#contract--burialSiteId').value = '';
            refreshDirectionsOfArrival();
            setUnsavedChanges();
        }
    });
    const endDateElement = document.querySelector('#contract--contractEndDateString');
    if (endDateElement !== null) {
        document
            .querySelector('#contract--contractStartDateString')
            ?.addEventListener('change', () => {
            endDateElement.min = document.querySelector('#contract--contractStartDateString').value;
        });
        sunrise.initializeMinDateUpdate(document.querySelector('#contract--contractStartDateString'), endDateElement);
    }
    sunrise.initializeUnlockFieldButtons(formElement);
    document
        .querySelector('#panelToggle--services')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        clickEvent.currentTarget
            .closest('.panel')
            ?.querySelector('.panel-block.is-hidden')
            ?.classList.remove('is-hidden');
    });
    if (isCreate) {
        document
            .querySelector('#contract--funeralHomeId')
            ?.addEventListener('change', (changeEvent) => {
            const funeralHomeId = changeEvent.currentTarget
                .value;
            document
                .querySelector('#container--newFuneralHome')
                ?.classList.toggle('is-hidden', funeralHomeId !== 'new');
        });
    }
    const funeralHomeSelect = document.querySelector('#contract--funeralHomeId');
    const funeralDirectorDatalist = document.querySelector('#datalist--funeralDirectors');
    funeralHomeSelect?.addEventListener('change', (event) => {
        const funeralHomeId = event.currentTarget.value;
        funeralDirectorDatalist?.replaceChildren();
        if (funeralHomeId === '') {
            return;
        }
        cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doGetFuneralDirectors`, {
            funeralHomeId
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            for (const funeralDirectorName of responseJSON.funeralDirectorNames) {
                const option = document.createElement('option');
                option.value = funeralDirectorName;
                funeralDirectorDatalist?.append(option);
            }
        });
    });
    if (isCreate) {
        document
            .querySelector('#button--copyFromPurchaser')
            ?.addEventListener('click', () => {
            const fieldsToCopy = [
                'Name',
                'Address1',
                'Address2',
                'City',
                'Province',
                'PostalCode'
            ];
            for (const fieldToCopy of fieldsToCopy) {
                const purchaserFieldElement = document.querySelector(`#contract--purchaser${fieldToCopy}`);
                const deceasedFieldElement = document.querySelector(`#contract--deceased${fieldToCopy}`);
                deceasedFieldElement.value = purchaserFieldElement.value;
            }
            setUnsavedChanges();
        });
        const birthYearElement = document.querySelector('#contract--birthYear');
        const deathYearElement = document.querySelector('#contract--deathYear');
        const getEditDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
        const initializeEditDatePartValidation = (yearElement, monthElement, dayElement, enforcePast) => {
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1;
            const currentDay = today.getDate();
            const updateMaxDay = () => {
                const yearValue = Number.parseInt(yearElement.value, 10);
                const monthValue = Number.parseInt(monthElement.value, 10);
                if (!monthValue) {
                    dayElement.max = '31';
                    return;
                }
                const yearForCalc = yearValue || currentYear;
                let maxDay = getEditDaysInMonth(yearForCalc, monthValue);
                if (enforcePast &&
                    yearValue === currentYear &&
                    monthValue === currentMonth) {
                    maxDay = Math.min(maxDay, currentDay);
                }
                dayElement.max = maxDay.toString();
                if (dayElement.value !== '' && Number(dayElement.value) > maxDay) {
                    dayElement.value = maxDay.toString();
                }
            };
            const updateMaxMonth = () => {
                const yearValue = Number.parseInt(yearElement.value, 10);
                if (enforcePast && yearValue === currentYear) {
                    monthElement.max = currentMonth.toString();
                    if (monthElement.value !== '' &&
                        Number(monthElement.value) > currentMonth) {
                        monthElement.value = currentMonth.toString();
                    }
                }
                else {
                    monthElement.max = '12';
                }
                updateMaxDay();
            };
            if (enforcePast) {
                yearElement.max = currentYear.toString();
            }
            yearElement.addEventListener('change', () => {
                if (enforcePast &&
                    yearElement.value !== '' &&
                    Number(yearElement.value) > currentYear) {
                    yearElement.value = currentYear.toString();
                }
                updateMaxMonth();
            });
            monthElement.addEventListener('change', updateMaxDay);
            updateMaxMonth();
        };
        initializeEditDatePartValidation(birthYearElement, document.querySelector('#contract--birthMonth'), document.querySelector('#contract--birthDay'), false);
        initializeEditDatePartValidation(deathYearElement, document.querySelector('#contract--deathMonth'), document.querySelector('#contract--deathDay'), true);
        const calculateDeathAgeButtonElement = document.querySelector('#button--calculateDeathAge');
        const toggleDeathAgeCalculatorButton = () => {
            if (birthYearElement.value === '' || deathYearElement.value === '') {
                calculateDeathAgeButtonElement.setAttribute('disabled', 'disabled');
            }
            else {
                calculateDeathAgeButtonElement.removeAttribute('disabled');
            }
        };
        birthYearElement.addEventListener('change', toggleDeathAgeCalculatorButton);
        deathYearElement.addEventListener('change', toggleDeathAgeCalculatorButton);
        calculateDeathAgeButtonElement.addEventListener('click', (clickEvent) => {
            clickEvent.preventDefault();
            if (birthYearElement.value === '' || deathYearElement.value === '') {
                return;
            }
            const birthYear = Number.parseInt(birthYearElement.value, 10);
            const deathYear = Number.parseInt(deathYearElement.value, 10);
            const birthMonthElement = document.querySelector('#contract--birthMonth');
            const birthDayElement = document.querySelector('#contract--birthDay');
            const deathMonthElement = document.querySelector('#contract--deathMonth');
            const deathDayElement = document.querySelector('#contract--deathDay');
            const deathAgeElement = document.querySelector('#contract--deathAge');
            const deathAgePeriodElement = document.querySelector('#contract--deathAgePeriod');
            let ageInYears;
            if (birthMonthElement.value !== '' &&
                birthDayElement.value !== '' &&
                deathMonthElement.value !== '' &&
                deathDayElement.value !== '') {
                const birthMonth = Number.parseInt(birthMonthElement.value, 10);
                const birthDay = Number.parseInt(birthDayElement.value, 10);
                const deathMonth = Number.parseInt(deathMonthElement.value, 10);
                const deathDay = Number.parseInt(deathDayElement.value, 10);
                const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
                const deathDate = new Date(deathYear, deathMonth - 1, deathDay);
                const ageInDays = Math.floor((deathDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
                if (ageInDays <= 0) {
                    deathAgeElement.value = '0';
                    deathAgePeriodElement.value = 'Stillborn';
                    setUnsavedChanges();
                    return;
                }
                ageInYears = Math.floor(ageInDays / 365.25);
                if (ageInYears === 0) {
                    deathAgeElement.value = ageInDays.toString();
                    deathAgePeriodElement.value = 'Days';
                    setUnsavedChanges();
                    return;
                }
            }
            else {
                ageInYears = deathYear - birthYear;
            }
            if (ageInYears > 0) {
                deathAgeElement.value = ageInYears.toString();
                deathAgePeriodElement.value = 'Years';
            }
            else {
                deathAgeElement.value = '0';
                deathAgePeriodElement.value = 'Stillborn';
            }
            setUnsavedChanges();
        });
    }
})();

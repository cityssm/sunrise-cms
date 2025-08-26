"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const contractId = document.querySelector('#contract--contractId').value;
    const isCreate = contractId === '';
    /*
     * Main form
     */
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
        cityssm.postJSON(`${sunrise.urlPrefix}/contracts/${isCreate ? 'doCreateContract' : 'doUpdateContract'}`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                clearUnsavedChanges();
                if (isCreate || refreshAfterSave) {
                    globalThis.location.href = sunrise.getContractURL(responseJSON.contractId, true, true);
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
                    title: 'Error Saving Contract',
                    message: responseJSON.errorMessage ?? ''
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
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                clearUnsavedChanges();
                globalThis.location.href = sunrise.getContractURL(responseJSON.contractId, true);
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Copying Record',
                    message: responseJSON.errorMessage ?? ''
                });
            }
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
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    clearUnsavedChanges();
                    globalThis.location.href = sunrise.getContractURL();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Deleting Record',
                        message: responseJSON.errorMessage ?? ''
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
    // Contract Type
    const contractTypeIdElement = document.querySelector('#contract--contractTypeId');
    if (isCreate) {
        const contractFieldsContainerElement = document.querySelector('#container--contractFields');
        contractTypeIdElement.addEventListener('change', () => {
            const recipientOrPreneedElements = document.querySelectorAll('.is-recipient-or-deceased');
            const isPreneed = contractTypeIdElement.selectedOptions[0].dataset.isPreneed === 'true';
            for (const recipientOrPreneedElement of recipientOrPreneedElements) {
                recipientOrPreneedElement.textContent = isPreneed
                    ? 'Recipient'
                    : 'Deceased';
            }
            if (contractTypeIdElement.value === '') {
                contractFieldsContainerElement.innerHTML = `<div class="message is-info">
          <p class="message-body">Select the contract type to load the available fields.</p>
          </div>`;
                return;
            }
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doGetContractTypeFields`, {
                contractTypeId: contractTypeIdElement.value
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.contractTypeFields.length === 0) {
                    contractFieldsContainerElement.innerHTML = `<div class="message is-info">
              <p class="message-body">There are no additional fields for this contract type.</p>
              </div>`;
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
                    fieldElement.innerHTML = `<label class="label" for="${cityssm.escapeHTML(fieldId)}"></label><div class="control"></div>`;
                    fieldElement.querySelector('label').textContent = contractTypeField.contractTypeField;
                    if (contractTypeField.fieldType === 'select' ||
                        (contractTypeField.fieldValues ?? '') !== '') {
                        ;
                        fieldElement.querySelector('.control').innerHTML = `<div class="select is-fullwidth">
                  <select id="${cityssm.escapeHTML(fieldId)}" name="${cityssm.escapeHTML(fieldName)}">
                  <option value="">(Not Set)</option>
                  </select>
                  </div>`;
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
                contractFieldsContainerElement.insertAdjacentHTML('beforeend', 
                // eslint-disable-next-line no-secrets/no-secrets
                `<input name="contractTypeFieldIds" type="hidden"
              value="${cityssm.escapeHTML(contractTypeFieldIds.slice(1))}" />`);
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
    // Burial Site Selector
    const burialSiteIdElement = document.querySelector('#contract--burialSiteId');
    const burialSiteNameElement = document.querySelector('#contract--burialSiteName');
    const directionOfArrivalElement = document.querySelector('#contract--directionOfArrival');
    function refreshDirectionsOfArrival() {
        const burialSiteId = burialSiteIdElement.value;
        cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doGetBurialSiteDirectionsOfArrival`, {
            burialSiteId
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            const currentDirectionOfArrival = directionOfArrivalElement.value;
            directionOfArrivalElement.value = '';
            directionOfArrivalElement.innerHTML =
                '<option value="">(No Direction)</option>';
            for (const direction of exports.directionsOfArrival) {
                // eslint-disable-next-line security/detect-object-injection
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
            // eslint-disable-next-line no-unsanitized/property
            burialSiteSelectResultsElement.innerHTML =
                sunrise.getLoadingParagraphHTML('Searching...');
            cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doSearchBurialSites`, burialSiteSelectFormElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.count === 0) {
                    burialSiteSelectResultsElement.innerHTML = `<div class="message is-info">
              <p class="message-body">No results.</p>
              </div>`;
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
                    // eslint-disable-next-line no-unsanitized/property
                    panelBlockElement.innerHTML = `<div class="columns">
              <div class="column">
                ${cityssm.escapeHTML(burialSite.burialSiteName ?? '')}<br />
                <span class="is-size-7">${cityssm.escapeHTML(burialSite.cemeteryName ?? '')}</span>
              </div>
              <div class="column">
                ${cityssm.escapeHTML(burialSite.burialSiteStatus)}<br />
                <span class="is-size-7">
                  ${(burialSite.contractCount ?? 0) > 0 ? 'Has Current Contract' : ''}
                </span>
              </div>
              </div>`;
                    panelBlockElement.addEventListener('click', selectExistingBurialSite);
                    panelElement.append(panelBlockElement);
                }
                burialSiteSelectResultsElement.innerHTML = '';
                burialSiteSelectResultsElement.append(panelElement);
            });
        }
        function createBurialSite(createEvent) {
            createEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doCreateBurialSite`, burialSiteCreateFormElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    setUnsavedChanges();
                    renderSelectedBurialSiteAndClose(responseJSON.burialSiteId ?? 0, responseJSON.burialSiteName ?? '');
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Creating Burial Site',
                        message: responseJSON.errorMessage ?? ''
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
                // Search Tab
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
                /*
                 * New Burial Site Tab
                 */
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
            window.open(`${sunrise.urlPrefix}/burialSites/${burialSiteId}`);
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
    // Start Date
    document
        .querySelector('#contract--contractStartDateString')
        ?.addEventListener('change', () => {
        const endDateElement = document.querySelector('#contract--contractEndDateString');
        endDateElement.min = document.querySelector('#contract--contractStartDateString').value;
    });
    sunrise.initializeMinDateUpdate(document.querySelector('#contract--contractStartDateString'), document.querySelector('#contract--contractEndDateString'));
    sunrise.initializeUnlockFieldButtons(formElement);
    /*
     * Funeral
     */
    document
        .querySelector('#panelToggle--funeral')
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
    // Handle funeral home selection change
    funeralHomeSelect?.addEventListener('change', (event) => {
        const funeralHomeId = event.currentTarget.value;
        // Clear existing suggestions
        funeralDirectorDatalist?.replaceChildren();
        if (funeralHomeId === '') {
            return;
        }
        // Make AJAX request to get suggestions
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
    /*
     * Deceased
     */
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
        const birthDateStringElement = document.querySelector('#contract--birthDateString');
        const deathDateStringElement = document.querySelector('#contract--deathDateString');
        sunrise.initializeMinDateUpdate(birthDateStringElement, deathDateStringElement);
        sunrise.initializeMinDateUpdate(deathDateStringElement, document.querySelector('#contract--funeralDateString'));
        const calculateDeathAgeButtonElement = document.querySelector('#button--calculateDeathAge');
        function toggleDeathAgeCalculatorButton() {
            if (birthDateStringElement.value === '' ||
                deathDateStringElement.value === '') {
                calculateDeathAgeButtonElement.setAttribute('disabled', 'disabled');
            }
            else {
                calculateDeathAgeButtonElement.removeAttribute('disabled');
            }
        }
        birthDateStringElement.addEventListener('change', toggleDeathAgeCalculatorButton);
        deathDateStringElement.addEventListener('change', toggleDeathAgeCalculatorButton);
        calculateDeathAgeButtonElement.addEventListener('click', (clickEvent) => {
            clickEvent.preventDefault();
            const birthDate = new Date(birthDateStringElement.value);
            const deathDate = new Date(deathDateStringElement.value);
            const ageInDays = Math.floor((deathDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
            const ageInYears = Math.floor(ageInDays / 365.25);
            const deathAgeElement = document.querySelector('#contract--deathAge');
            const deathAgePeriodElement = document.querySelector('#contract--deathAgePeriod');
            if (ageInYears > 0) {
                deathAgeElement.value = ageInYears.toString();
                deathAgePeriodElement.value = 'Years';
            }
            else if (ageInDays > 0) {
                deathAgeElement.value = ageInDays.toString();
                deathAgePeriodElement.value = 'Days';
            }
            else {
                deathAgeElement.value = '0';
                deathAgePeriodElement.value = 'Stillborn';
            }
            setUnsavedChanges();
        });
    }
    /*
     * Attachment Upload
     */
    if (!isCreate) {
        document
            .querySelector('#button--uploadAttachment')
            ?.addEventListener('click', (clickEvent) => {
            clickEvent.preventDefault();
            let uploadFormElement;
            let uploadCloseModalFunction;
            function uploadAttachment(submitEvent) {
                submitEvent.preventDefault();
                const formData = new FormData(uploadFormElement);
                formData.set('contractId', contractId);
                // Disable submit button and show loading
                const submitButton = uploadFormElement.querySelector('button[type="submit"]');
                const originalText = submitButton.querySelector('span:last-child').textContent;
                submitButton.disabled = true;
                submitButton.querySelector('span:last-child').textContent = 'Uploading...';
                fetch(`${sunrise.urlPrefix}/contracts/doUploadContractAttachment`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-Token': document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? ''
                    }
                })
                    .then(async (response) => await response.json())
                    .then((responseJSON) => {
                    if (responseJSON.success) {
                        bulmaJS.alert({
                            contextualColorName: 'success',
                            message: 'Attachment uploaded successfully.'
                        });
                        if (uploadCloseModalFunction !== undefined) {
                            uploadCloseModalFunction();
                        }
                        // Refresh the page to show the new attachment
                        globalThis.location.reload();
                    }
                    else {
                        bulmaJS.alert({
                            contextualColorName: 'danger',
                            title: 'Error Uploading Attachment',
                            message: responseJSON.errorMessage ??
                                'An error occurred while uploading the file.'
                        });
                    }
                })
                    .catch(() => {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Uploading Attachment',
                        message: 'An error occurred while uploading the file.'
                    });
                })
                    .finally(() => {
                    // Re-enable submit button
                    submitButton.disabled = false;
                    submitButton.querySelector('span:last-child').textContent = originalText;
                });
            }
            cityssm.openHtmlModal('contract-uploadAttachment', {
                onshow(modalElement) {
                    sunrise.populateAliases(modalElement);
                    modalElement
                        .querySelector('#contractAttachmentUpload--contractId')
                        ?.setAttribute('value', contractId);
                },
                onshown(modalElement, closeModalFunction) {
                    bulmaJS.toggleHtmlClipped();
                    uploadCloseModalFunction = closeModalFunction;
                    bulmaJS.init(modalElement);
                    uploadFormElement = modalElement.querySelector('#form--contractAttachmentUpload');
                    uploadFormElement.addEventListener('submit', uploadAttachment);
                    // Focus on file input
                    modalElement
                        .querySelector('#contractAttachmentUpload--file')
                        ?.focus();
                },
                onremoved() {
                    bulmaJS.toggleHtmlClipped();
                }
            });
        });
    }
})();

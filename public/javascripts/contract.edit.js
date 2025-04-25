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
                        message: 'Contract Updated Successfully',
                        contextualColorName: 'success'
                    });
                }
            }
            else {
                bulmaJS.alert({
                    title: 'Error Saving Contract',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
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
                    title: 'Error Copying Record',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
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
                title: 'Unsaved Changes',
                message: 'Please save all unsaved changes before continuing.',
                contextualColorName: 'warning'
            });
        }
        else {
            bulmaJS.confirm({
                title: 'Copy Contract Record as New',
                message: 'Are you sure you want to copy this record to a new record?',
                contextualColorName: 'info',
                okButton: {
                    text: 'Yes, Copy',
                    callbackFunction: doCopy
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
                        title: 'Error Deleting Record',
                        message: responseJSON.errorMessage ?? '',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Delete Contract Record',
            message: 'Are you sure you want to delete this record?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete',
                callbackFunction: doDelete
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
                    title: 'Confirm Change',
                    message: `Are you sure you want to change the contract type?\n
            This change affects the additional fields associated with this record, and may also affect the available fees.`,
                    contextualColorName: 'warning',
                    okButton: {
                        text: 'Yes, Keep the Change',
                        callbackFunction: () => {
                            refreshAfterSave = true;
                        }
                    },
                    cancelButton: {
                        text: 'Revert the Change',
                        callbackFunction: () => {
                            contractTypeIdElement.value = originalContractTypeId;
                        }
                    }
                });
            }
        });
    }
    // Burial Site Selector
    const burialSiteNameElement = document.querySelector('#contract--burialSiteName');
    burialSiteNameElement.addEventListener('click', (clickEvent) => {
        const currentBurialSiteName = clickEvent.currentTarget
            .value;
        let burialSiteSelectCloseModalFunction;
        let burialSiteSelectFormElement;
        let burialSiteSelectResultsElement;
        let burialSiteCreateFormElement;
        function renderSelectedBurialSiteAndClose(burialSiteId, burialSiteName) {
            ;
            document.querySelector('#contract--burialSiteId').value = burialSiteId.toString();
            document.querySelector('#contract--burialSiteName').value = burialSiteName;
            setUnsavedChanges();
            burialSiteSelectCloseModalFunction();
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
                        title: 'Error Creating Burial Site',
                        message: responseJSON.errorMessage ?? '',
                        contextualColorName: 'danger'
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
                message: 'No burial site selected.',
                contextualColorName: 'info'
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
                message: 'You need to unlock the field before clearing it.',
                contextualColorName: 'info'
            });
        }
        else {
            burialSiteNameElement.value = '(No Burial Site)';
            document.querySelector('#contract--burialSiteId').value = '';
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
    if (isCreate) {
        /*
         * Deceased
         */
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
        sunrise.initializeMinDateUpdate(document.querySelector('#contract--birthDateString'), document.querySelector('#contract--deathDateString'));
        sunrise.initializeMinDateUpdate(document.querySelector('#contract--deathDateString'), document.querySelector('#contract--funeralDateString'));
    }
})();

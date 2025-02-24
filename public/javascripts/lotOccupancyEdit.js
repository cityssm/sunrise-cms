"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const los = exports.los;
    const lotOccupancyId = document.querySelector('#lotOccupancy--lotOccupancyId').value;
    const isCreate = lotOccupancyId === '';
    /*
     * Main form
     */
    let refreshAfterSave = isCreate;
    function setUnsavedChanges() {
        los.setUnsavedChanges();
        document
            .querySelector("button[type='submit'][form='form--lotOccupancy']")
            ?.classList.remove('is-light');
    }
    function clearUnsavedChanges() {
        los.clearUnsavedChanges();
        document
            .querySelector("button[type='submit'][form='form--lotOccupancy']")
            ?.classList.add('is-light');
    }
    const formElement = document.querySelector('#form--lotOccupancy');
    formElement.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
        cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/${isCreate ? 'doCreateLotOccupancy' : 'doUpdateLotOccupancy'}`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                clearUnsavedChanges();
                if (isCreate || refreshAfterSave) {
                    globalThis.location.href = los.getLotOccupancyURL(responseJSON.lotOccupancyId, true, true);
                }
                else {
                    bulmaJS.alert({
                        message: `${los.escapedAliases.Occupancy} Updated Successfully`,
                        contextualColorName: 'success'
                    });
                }
            }
            else {
                bulmaJS.alert({
                    title: `Error Saving ${los.escapedAliases.Occupancy}`,
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
        cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doCopyLotOccupancy`, {
            lotOccupancyId
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                clearUnsavedChanges();
                globalThis.location.href = los.getLotOccupancyURL(responseJSON.lotOccupancyId, true);
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
        .querySelector('#button--copyLotOccupancy')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        if (los.hasUnsavedChanges()) {
            bulmaJS.alert({
                title: 'Unsaved Changes',
                message: 'Please save all unsaved changes before continuing.',
                contextualColorName: 'warning'
            });
        }
        else {
            bulmaJS.confirm({
                title: `Copy ${los.escapedAliases.Occupancy} Record as New`,
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
        .querySelector('#button--deleteLotOccupancy')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        function doDelete() {
            cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doDeleteLotOccupancy`, {
                lotOccupancyId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    clearUnsavedChanges();
                    globalThis.location.href = los.getLotOccupancyURL();
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
            title: `Delete ${los.escapedAliases.Occupancy} Record`,
            message: 'Are you sure you want to delete this record?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete',
                callbackFunction: doDelete
            }
        });
    });
    document
        .querySelector('#button--createWorkOrder')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        let createCloseModalFunction;
        function doCreate(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${los.urlPrefix}/workOrders/doCreateWorkOrder`, formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    createCloseModalFunction();
                    bulmaJS.confirm({
                        title: 'Work Order Created Successfully',
                        message: 'Would you like to open the work order now?',
                        contextualColorName: 'success',
                        okButton: {
                            text: 'Yes, Open the Work Order',
                            callbackFunction: () => {
                                globalThis.location.href = los.getWorkOrderURL(responseJSON.workOrderId, true);
                            }
                        }
                    });
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Creating Work Order',
                        message: responseJSON.errorMessage,
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        cityssm.openHtmlModal('lotOccupancy-createWorkOrder', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('#workOrderCreate--lotOccupancyId').value = lotOccupancyId;
                modalElement.querySelector('#workOrderCreate--workOrderOpenDateString').value = cityssm.dateToString(new Date());
                const workOrderTypeSelectElement = modalElement.querySelector('#workOrderCreate--workOrderTypeId');
                const workOrderTypes = exports
                    .workOrderTypes;
                if (workOrderTypes.length === 1) {
                    workOrderTypeSelectElement.innerHTML = '';
                }
                for (const workOrderType of workOrderTypes) {
                    const optionElement = document.createElement('option');
                    optionElement.value = workOrderType.workOrderTypeId.toString();
                    optionElement.textContent = workOrderType.workOrderType ?? '';
                    workOrderTypeSelectElement.append(optionElement);
                }
            },
            onshown(modalElement, closeModalFunction) {
                createCloseModalFunction = closeModalFunction;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#workOrderCreate--workOrderTypeId').focus();
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doCreate);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
                document.querySelector('#button--createWorkOrder').focus();
            }
        });
    });
    // Occupancy Type
    const occupancyTypeIdElement = document.querySelector('#lotOccupancy--occupancyTypeId');
    if (isCreate) {
        const lotOccupancyFieldsContainerElement = document.querySelector('#container--lotOccupancyFields');
        occupancyTypeIdElement.addEventListener('change', () => {
            if (occupancyTypeIdElement.value === '') {
                // eslint-disable-next-line no-unsanitized/property
                lotOccupancyFieldsContainerElement.innerHTML = `<div class="message is-info">
          <p class="message-body">Select the ${los.escapedAliases.occupancy} type to load the available fields.</p>
          </div>`;
                return;
            }
            cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doGetOccupancyTypeFields`, {
                occupancyTypeId: occupancyTypeIdElement.value
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.occupancyTypeFields.length === 0) {
                    // eslint-disable-next-line no-unsanitized/property
                    lotOccupancyFieldsContainerElement.innerHTML = `<div class="message is-info">
              <p class="message-body">There are no additional fields for this ${los.escapedAliases.occupancy} type.</p>
              </div>`;
                    return;
                }
                lotOccupancyFieldsContainerElement.innerHTML = '';
                let occupancyTypeFieldIds = '';
                for (const occupancyTypeField of responseJSON.occupancyTypeFields) {
                    occupancyTypeFieldIds += `,${occupancyTypeField.occupancyTypeFieldId.toString()}`;
                    const fieldName = `lotOccupancyFieldValue_${occupancyTypeField.occupancyTypeFieldId.toString()}`;
                    const fieldId = `lotOccupancy--${fieldName}`;
                    const fieldElement = document.createElement('div');
                    fieldElement.className = 'field';
                    fieldElement.innerHTML = `<label class="label" for="${cityssm.escapeHTML(fieldId)}"></label><div class="control"></div>`;
                    fieldElement.querySelector('label').textContent = occupancyTypeField.occupancyTypeField;
                    if (occupancyTypeField.fieldType === 'select' ||
                        (occupancyTypeField.occupancyTypeFieldValues ?? '') !== '') {
                        ;
                        fieldElement.querySelector('.control').innerHTML = `<div class="select is-fullwidth">
                  <select id="${cityssm.escapeHTML(fieldId)}" name="${cityssm.escapeHTML(fieldName)}">
                  <option value="">(Not Set)</option>
                  </select>
                  </div>`;
                        const selectElement = fieldElement.querySelector('select');
                        selectElement.required = occupancyTypeField.isRequired;
                        const optionValues = occupancyTypeField.occupancyTypeFieldValues.split('\n');
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
                        inputElement.type = occupancyTypeField.fieldType;
                        inputElement.required = occupancyTypeField.isRequired;
                        inputElement.minLength =
                            occupancyTypeField.minimumLength;
                        inputElement.maxLength =
                            occupancyTypeField.maximumLength;
                        if ((occupancyTypeField.pattern ?? '') !== '') {
                            inputElement.pattern = occupancyTypeField.pattern;
                        }
                        ;
                        fieldElement.querySelector('.control').append(inputElement);
                    }
                    console.log(fieldElement);
                    lotOccupancyFieldsContainerElement.append(fieldElement);
                }
                lotOccupancyFieldsContainerElement.insertAdjacentHTML('beforeend', 
                // eslint-disable-next-line no-secrets/no-secrets
                `<input name="occupancyTypeFieldIds" type="hidden"
              value="${cityssm.escapeHTML(occupancyTypeFieldIds.slice(1))}" />`);
            });
        });
    }
    else {
        const originalOccupancyTypeId = occupancyTypeIdElement.value;
        occupancyTypeIdElement.addEventListener('change', () => {
            if (occupancyTypeIdElement.value !== originalOccupancyTypeId) {
                bulmaJS.confirm({
                    title: 'Confirm Change',
                    message: `Are you sure you want to change the ${los.escapedAliases.occupancy} type?\n
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
                            occupancyTypeIdElement.value = originalOccupancyTypeId;
                        }
                    }
                });
            }
        });
    }
    // Lot Selector
    const lotNameElement = document.querySelector('#lotOccupancy--lotName');
    lotNameElement.addEventListener('click', (clickEvent) => {
        const currentLotName = clickEvent.currentTarget.value;
        let lotSelectCloseModalFunction;
        let lotSelectModalElement;
        let lotSelectFormElement;
        let lotSelectResultsElement;
        function renderSelectedLotAndClose(lotId, lotName) {
            ;
            document.querySelector('#lotOccupancy--lotId').value = lotId.toString();
            document.querySelector('#lotOccupancy--lotName').value = lotName;
            setUnsavedChanges();
            lotSelectCloseModalFunction();
        }
        function selectExistingLot(clickEvent) {
            clickEvent.preventDefault();
            const selectedLotElement = clickEvent.currentTarget;
            renderSelectedLotAndClose(selectedLotElement.dataset.lotId ?? '', selectedLotElement.dataset.lotName ?? '');
        }
        function searchLots() {
            // eslint-disable-next-line no-unsanitized/property
            lotSelectResultsElement.innerHTML =
                los.getLoadingParagraphHTML('Searching...');
            cityssm.postJSON(`${los.urlPrefix}/lots/doSearchLots`, lotSelectFormElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.count === 0) {
                    lotSelectResultsElement.innerHTML = `<div class="message is-info">
              <p class="message-body">No results.</p>
              </div>`;
                    return;
                }
                const panelElement = document.createElement('div');
                panelElement.className = 'panel';
                for (const lot of responseJSON.lots) {
                    const panelBlockElement = document.createElement('a');
                    panelBlockElement.className = 'panel-block is-block';
                    panelBlockElement.href = '#';
                    panelBlockElement.dataset.lotId = lot.lotId.toString();
                    panelBlockElement.dataset.lotName = lot.lotName;
                    // eslint-disable-next-line no-unsanitized/property
                    panelBlockElement.innerHTML = `<div class="columns">
              <div class="column">
                ${cityssm.escapeHTML(lot.lotName ?? '')}<br />
                <span class="is-size-7">${cityssm.escapeHTML(lot.mapName ?? '')}</span>
              </div>
              <div class="column">
                ${cityssm.escapeHTML(lot.lotStatus)}<br />
                <span class="is-size-7">
                  ${lot.lotOccupancyCount > 0 ? 'Currently Occupied' : ''}
                </span>
              </div>
              </div>`;
                    panelBlockElement.addEventListener('click', selectExistingLot);
                    panelElement.append(panelBlockElement);
                }
                lotSelectResultsElement.innerHTML = '';
                lotSelectResultsElement.append(panelElement);
            });
        }
        function createLotAndSelect(submitEvent) {
            submitEvent.preventDefault();
            const lotName = lotSelectModalElement.querySelector('#lotCreate--lotName').value;
            cityssm.postJSON(`${los.urlPrefix}/lots/doCreateLot`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    renderSelectedLotAndClose(responseJSON.lotId ?? '', lotName);
                }
                else {
                    bulmaJS.alert({
                        title: `Error Creating ${los.escapedAliases.Lot}`,
                        message: responseJSON.errorMessage ?? '',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        cityssm.openHtmlModal('lotOccupancy-selectLot', {
            onshow(modalElement) {
                los.populateAliases(modalElement);
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                lotSelectModalElement = modalElement;
                lotSelectCloseModalFunction = closeModalFunction;
                bulmaJS.init(modalElement);
                // search Tab
                const lotNameFilterElement = modalElement.querySelector('#lotSelect--lotName');
                if (document.querySelector('#lotOccupancy--lotId')
                    .value !== '') {
                    lotNameFilterElement.value = currentLotName;
                }
                lotNameFilterElement.focus();
                lotNameFilterElement.addEventListener('change', searchLots);
                const occupancyStatusFilterElement = modalElement.querySelector('#lotSelect--occupancyStatus');
                occupancyStatusFilterElement.addEventListener('change', searchLots);
                if (currentLotName !== '') {
                    occupancyStatusFilterElement.value = '';
                }
                lotSelectFormElement = modalElement.querySelector('#form--lotSelect');
                lotSelectResultsElement = modalElement.querySelector('#resultsContainer--lotSelect');
                lotSelectFormElement.addEventListener('submit', (submitEvent) => {
                    submitEvent.preventDefault();
                });
                searchLots();
                // Create Tab
                if (exports.lotNamePattern) {
                    const regex = exports.lotNamePattern;
                    modalElement.querySelector('#lotCreate--lotName').pattern = regex.source;
                }
                const lotTypeElement = modalElement.querySelector('#lotCreate--burialSiteTypeId');
                for (const lotType of exports.lotTypes) {
                    const optionElement = document.createElement('option');
                    optionElement.value = lotType.burialSiteTypeId.toString();
                    optionElement.textContent = lotType.lotType;
                    lotTypeElement.append(optionElement);
                }
                const lotStatusElement = modalElement.querySelector('#lotCreate--burialSiteStatusId');
                for (const lotStatus of exports.lotStatuses) {
                    const optionElement = document.createElement('option');
                    optionElement.value = lotStatus.burialSiteStatusId.toString();
                    optionElement.textContent = lotStatus.lotStatus;
                    lotStatusElement.append(optionElement);
                }
                const mapElement = modalElement.querySelector('#lotCreate--mapId');
                for (const map of exports.maps) {
                    const optionElement = document.createElement('option');
                    optionElement.value = map.mapId.toString();
                    optionElement.textContent =
                        (map.mapName ?? '') === '' ? '(No Name)' : map.mapName ?? '';
                    mapElement.append(optionElement);
                }
                ;
                modalElement.querySelector('#form--lotCreate').addEventListener('submit', createLotAndSelect);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    document
        .querySelector('.is-lot-view-button')
        ?.addEventListener('click', () => {
        const lotId = document.querySelector('#lotOccupancy--lotId').value;
        if (lotId === '') {
            bulmaJS.alert({
                message: `No ${los.escapedAliases.lot} selected.`,
                contextualColorName: 'info'
            });
        }
        else {
            window.open(`${los.urlPrefix}/lots/${lotId}`);
        }
    });
    document
        .querySelector('.is-clear-lot-button')
        ?.addEventListener('click', () => {
        if (lotNameElement.disabled) {
            bulmaJS.alert({
                message: 'You need to unlock the field before clearing it.',
                contextualColorName: 'info'
            });
        }
        else {
            lotNameElement.value = `(No ${los.escapedAliases.Lot})`;
            document.querySelector('#lotOccupancy--lotId').value = '';
            setUnsavedChanges();
        }
    });
    // Start Date
    los.initializeDatePickers(formElement);
    document
        .querySelector('#lotOccupancy--occupancyStartDateString')
        ?.addEventListener('change', () => {
        const endDatePicker = document.querySelector('#lotOccupancy--occupancyEndDateString').bulmaCalendar.datePicker;
        endDatePicker.min = document.querySelector('#lotOccupancy--occupancyStartDateString').value;
        endDatePicker.refresh();
    });
    los.initializeUnlockFieldButtons(formElement);
    (() => {
        let lotOccupancyOccupants = exports.lotOccupancyOccupants;
        delete exports.lotOccupancyOccupants;
        function openEditLotOccupancyOccupant(clickEvent) {
            const lotOccupantIndex = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
                .lotOccupantIndex ?? '', 10);
            const lotOccupancyOccupant = lotOccupancyOccupants.find((currentLotOccupancyOccupant) => {
                return (currentLotOccupancyOccupant.lotOccupantIndex === lotOccupantIndex);
            });
            let editFormElement;
            let editCloseModalFunction;
            function editOccupant(submitEvent) {
                submitEvent.preventDefault();
                cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doUpdateLotOccupancyOccupant`, editFormElement, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        lotOccupancyOccupants = responseJSON.lotOccupancyOccupants;
                        editCloseModalFunction();
                        renderLotOccupancyOccupants();
                    }
                    else {
                        bulmaJS.alert({
                            title: `Error Updating ${los.escapedAliases.Occupant}`,
                            message: responseJSON.errorMessage ?? '',
                            contextualColorName: 'danger'
                        });
                    }
                });
            }
            cityssm.openHtmlModal('lotOccupancy-editOccupant', {
                onshow(modalElement) {
                    los.populateAliases(modalElement);
                    modalElement.querySelector('#lotOccupancyOccupantEdit--lotOccupancyId').value = lotOccupancyId;
                    modalElement.querySelector('#lotOccupancyOccupantEdit--lotOccupantIndex').value = lotOccupantIndex.toString();
                    const lotOccupantTypeSelectElement = modalElement.querySelector('#lotOccupancyOccupantEdit--lotOccupantTypeId');
                    let lotOccupantTypeSelected = false;
                    for (const lotOccupantType of exports.lotOccupantTypes) {
                        const optionElement = document.createElement('option');
                        optionElement.value = lotOccupantType.lotOccupantTypeId.toString();
                        optionElement.textContent = lotOccupantType.lotOccupantType;
                        optionElement.dataset.occupantCommentTitle =
                            lotOccupantType.occupantCommentTitle;
                        optionElement.dataset.fontAwesomeIconClass =
                            lotOccupantType.fontAwesomeIconClass;
                        if (lotOccupantType.lotOccupantTypeId ===
                            lotOccupancyOccupant.lotOccupantTypeId) {
                            optionElement.selected = true;
                            lotOccupantTypeSelected = true;
                        }
                        lotOccupantTypeSelectElement.append(optionElement);
                    }
                    if (!lotOccupantTypeSelected) {
                        const optionElement = document.createElement('option');
                        optionElement.value =
                            lotOccupancyOccupant.lotOccupantTypeId?.toString() ?? '';
                        optionElement.textContent =
                            lotOccupancyOccupant.lotOccupantType ?? '';
                        optionElement.dataset.occupantCommentTitle =
                            lotOccupancyOccupant.occupantCommentTitle;
                        optionElement.dataset.fontAwesomeIconClass =
                            lotOccupancyOccupant.fontAwesomeIconClass;
                        optionElement.selected = true;
                        lotOccupantTypeSelectElement.append(optionElement);
                    }
                    ;
                    modalElement.querySelector('#lotOccupancyOccupantEdit--fontAwesomeIconClass').innerHTML =
                        `<i class="fas fa-fw fa-${cityssm.escapeHTML(lotOccupancyOccupant.fontAwesomeIconClass ?? '')}" aria-hidden="true"></i>`;
                    modalElement.querySelector('#lotOccupancyOccupantEdit--occupantName').value = lotOccupancyOccupant.occupantName ?? '';
                    modalElement.querySelector('#lotOccupancyOccupantEdit--occupantFamilyName').value = lotOccupancyOccupant.occupantFamilyName ?? '';
                    modalElement.querySelector('#lotOccupancyOccupantEdit--occupantAddress1').value = lotOccupancyOccupant.occupantAddress1 ?? '';
                    modalElement.querySelector('#lotOccupancyOccupantEdit--occupantAddress2').value = lotOccupancyOccupant.occupantAddress2 ?? '';
                    modalElement.querySelector('#lotOccupancyOccupantEdit--occupantCity').value = lotOccupancyOccupant.occupantCity ?? '';
                    modalElement.querySelector('#lotOccupancyOccupantEdit--occupantProvince').value = lotOccupancyOccupant.occupantProvince ?? '';
                    modalElement.querySelector('#lotOccupancyOccupantEdit--occupantPostalCode').value = lotOccupancyOccupant.occupantPostalCode ?? '';
                    modalElement.querySelector('#lotOccupancyOccupantEdit--occupantPhoneNumber').value = lotOccupancyOccupant.occupantPhoneNumber ?? '';
                    modalElement.querySelector('#lotOccupancyOccupantEdit--occupantEmailAddress').value = lotOccupancyOccupant.occupantEmailAddress ?? '';
                    modalElement.querySelector('#lotOccupancyOccupantEdit--occupantCommentTitle').textContent =
                        (lotOccupancyOccupant.occupantCommentTitle ?? '') === ''
                            ? 'Comment'
                            : lotOccupancyOccupant.occupantCommentTitle ?? '';
                    modalElement.querySelector('#lotOccupancyOccupantEdit--occupantComment').value = lotOccupancyOccupant.occupantComment ?? '';
                },
                onshown(modalElement, closeModalFunction) {
                    bulmaJS.toggleHtmlClipped();
                    const lotOccupantTypeIdElement = modalElement.querySelector('#lotOccupancyOccupantEdit--lotOccupantTypeId');
                    lotOccupantTypeIdElement.focus();
                    lotOccupantTypeIdElement.addEventListener('change', () => {
                        const fontAwesomeIconClass = lotOccupantTypeIdElement.selectedOptions[0].dataset
                            .fontAwesomeIconClass ?? 'user';
                        modalElement.querySelector('#lotOccupancyOccupantEdit--fontAwesomeIconClass').innerHTML =
                            `<i class="fas fa-fw fa-${cityssm.escapeHTML(fontAwesomeIconClass)}" aria-hidden="true"></i>`;
                        let occupantCommentTitle = lotOccupantTypeIdElement.selectedOptions[0].dataset
                            .occupantCommentTitle ?? '';
                        if (occupantCommentTitle === '') {
                            occupantCommentTitle = 'Comment';
                        }
                        ;
                        modalElement.querySelector('#lotOccupancyOccupantEdit--occupantCommentTitle').textContent = occupantCommentTitle;
                    });
                    editFormElement = modalElement.querySelector('form');
                    editFormElement.addEventListener('submit', editOccupant);
                    editCloseModalFunction = closeModalFunction;
                },
                onremoved() {
                    bulmaJS.toggleHtmlClipped();
                }
            });
        }
        function deleteLotOccupancyOccupant(clickEvent) {
            const lotOccupantIndex = clickEvent.currentTarget.closest('tr')?.dataset.lotOccupantIndex;
            function doDelete() {
                cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doDeleteLotOccupancyOccupant`, {
                    lotOccupancyId,
                    lotOccupantIndex
                }, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        lotOccupancyOccupants = responseJSON.lotOccupancyOccupants;
                        renderLotOccupancyOccupants();
                    }
                    else {
                        bulmaJS.alert({
                            title: `Error Removing ${los.escapedAliases.Occupant}`,
                            message: responseJSON.errorMessage ?? '',
                            contextualColorName: 'danger'
                        });
                    }
                });
            }
            bulmaJS.confirm({
                title: `Remove ${los.escapedAliases.Occupant}?`,
                message: `Are you sure you want to remove this ${los.escapedAliases.occupant}?`,
                okButton: {
                    text: `Yes, Remove ${los.escapedAliases.Occupant}`,
                    callbackFunction: doDelete
                },
                contextualColorName: 'warning'
            });
        }
        function renderLotOccupancyOccupants() {
            const occupantsContainer = document.querySelector('#container--lotOccupancyOccupants');
            cityssm.clearElement(occupantsContainer);
            if (lotOccupancyOccupants.length === 0) {
                // eslint-disable-next-line no-unsanitized/property
                occupantsContainer.innerHTML = `<div class="message is-warning">
        <p class="message-body">There are no ${los.escapedAliases.occupants} associated with this record.</p>
        </div>`;
                return;
            }
            const tableElement = document.createElement('table');
            tableElement.className = 'table is-fullwidth is-striped is-hoverable';
            // eslint-disable-next-line no-unsanitized/property
            tableElement.innerHTML = `<thead><tr>
      <th>${los.escapedAliases.Occupant}</th>
      <th>Address</th>
      <th>Other Contact</th>
      <th>Comment</th>
      <th class="is-hidden-print"><span class="is-sr-only">Options</span></th>
      </tr></thead>
      <tbody></tbody>`;
            for (const lotOccupancyOccupant of lotOccupancyOccupants) {
                const tableRowElement = document.createElement('tr');
                tableRowElement.dataset.lotOccupantIndex =
                    lotOccupancyOccupant.lotOccupantIndex?.toString();
                // eslint-disable-next-line no-unsanitized/property
                tableRowElement.innerHTML = `<td>
        ${cityssm.escapeHTML((lotOccupancyOccupant.occupantName ?? '') === '' &&
                    (lotOccupancyOccupant.occupantFamilyName ?? '') === ''
                    ? '(No Name)'
                    : `${lotOccupancyOccupant.occupantName} ${lotOccupancyOccupant.occupantFamilyName}`)}<br />
        <span class="tag">
          <i class="fas fa-fw fa-${cityssm.escapeHTML(lotOccupancyOccupant.fontAwesomeIconClass ?? '')}" aria-hidden="true"></i>
          <span class="ml-1">${cityssm.escapeHTML(lotOccupancyOccupant.lotOccupantType ?? '')}</span>
        </span>
      </td><td>
        ${(lotOccupancyOccupant.occupantAddress1 ?? '') === ''
                    ? ''
                    : `${cityssm.escapeHTML(lotOccupancyOccupant.occupantAddress1 ?? '')}<br />`}
        ${(lotOccupancyOccupant.occupantAddress2 ?? '') === ''
                    ? ''
                    : `${cityssm.escapeHTML(lotOccupancyOccupant.occupantAddress2 ?? '')}<br />`}
        ${(lotOccupancyOccupant.occupantCity ?? '') === ''
                    ? ''
                    : `${cityssm.escapeHTML(lotOccupancyOccupant.occupantCity ?? '')}, `}
        ${cityssm.escapeHTML(lotOccupancyOccupant.occupantProvince ?? '')}<br />
        ${cityssm.escapeHTML(lotOccupancyOccupant.occupantPostalCode ?? '')}
      </td><td>
        ${(lotOccupancyOccupant.occupantPhoneNumber ?? '') === ''
                    ? ''
                    : `${cityssm.escapeHTML(lotOccupancyOccupant.occupantPhoneNumber ?? '')}<br />`}
        ${(lotOccupancyOccupant.occupantEmailAddress ?? '') === ''
                    ? ''
                    : cityssm.escapeHTML(lotOccupancyOccupant.occupantEmailAddress ?? '')}
      </td><td>
        <span data-tooltip="${cityssm.escapeHTML((lotOccupancyOccupant.occupantCommentTitle ?? '') === ''
                    ? 'Comment'
                    : lotOccupancyOccupant.occupantCommentTitle ?? '')}">
        ${cityssm.escapeHTML(lotOccupancyOccupant.occupantComment ?? '')}
        </span>
      </td><td class="is-hidden-print">
        <div class="buttons are-small is-justify-content-end">
          <button class="button is-primary button--edit" type="button">
            <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
            <span>Edit</span>
          </button>
          <button class="button is-light is-danger button--delete" data-tooltip="Delete ${los.escapedAliases.Occupant}" type="button" aria-label="Delete">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      </td>`;
                tableRowElement
                    .querySelector('.button--edit')
                    ?.addEventListener('click', openEditLotOccupancyOccupant);
                tableRowElement
                    .querySelector('.button--delete')
                    ?.addEventListener('click', deleteLotOccupancyOccupant);
                tableElement.querySelector('tbody')?.append(tableRowElement);
            }
            occupantsContainer.append(tableElement);
        }
        if (isCreate) {
            const lotOccupantTypeIdElement = document.querySelector('#lotOccupancy--lotOccupantTypeId');
            lotOccupantTypeIdElement.addEventListener('change', () => {
                const occupantFields = formElement.querySelectorAll("[data-table='LotOccupancyOccupant']");
                for (const occupantField of occupantFields) {
                    occupantField.disabled = lotOccupantTypeIdElement.value === '';
                }
                let occupantCommentTitle = lotOccupantTypeIdElement.selectedOptions[0].dataset
                    .occupantCommentTitle ?? '';
                if (occupantCommentTitle === '') {
                    occupantCommentTitle = 'Comment';
                }
                ;
                formElement.querySelector('#lotOccupancy--occupantCommentTitle').textContent = occupantCommentTitle;
            });
        }
        else {
            renderLotOccupancyOccupants();
        }
        document
            .querySelector('#button--addOccupant')
            ?.addEventListener('click', () => {
            let addCloseModalFunction;
            let addFormElement;
            let searchFormElement;
            let searchResultsElement;
            function addOccupant(formOrObject) {
                cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doAddLotOccupancyOccupant`, formOrObject, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    if (responseJSON.success) {
                        lotOccupancyOccupants = responseJSON.lotOccupancyOccupants;
                        addCloseModalFunction();
                        renderLotOccupancyOccupants();
                    }
                    else {
                        bulmaJS.alert({
                            title: `Error Adding ${los.escapedAliases.Occupant}`,
                            message: responseJSON.errorMessage ?? '',
                            contextualColorName: 'danger'
                        });
                    }
                });
            }
            function addOccupantFromForm(submitEvent) {
                submitEvent.preventDefault();
                addOccupant(addFormElement);
            }
            let pastOccupantSearchResults = [];
            function addOccupantFromCopy(clickEvent) {
                clickEvent.preventDefault();
                const panelBlockElement = clickEvent.currentTarget;
                const occupant = pastOccupantSearchResults[Number.parseInt(panelBlockElement.dataset.index ?? '', 10)];
                const lotOccupantTypeId = (panelBlockElement
                    .closest('.modal')
                    ?.querySelector('#lotOccupancyOccupantCopy--lotOccupantTypeId')).value;
                if (lotOccupantTypeId === '') {
                    bulmaJS.alert({
                        title: `No ${los.escapedAliases.Occupant} Type Selected`,
                        message: `Select a type to apply to the newly added ${los.escapedAliases.occupant}.`,
                        contextualColorName: 'warning'
                    });
                }
                else {
                    occupant.lotOccupantTypeId = Number.parseInt(lotOccupantTypeId, 10);
                    occupant.lotOccupancyId = Number.parseInt(lotOccupancyId, 10);
                    addOccupant(occupant);
                }
            }
            function searchOccupants(event) {
                event.preventDefault();
                if (searchFormElement.querySelector('#lotOccupancyOccupantCopy--searchFilter').value === '') {
                    searchResultsElement.innerHTML = `<div class="message is-info">
          <p class="message-body">Enter a partial name or address in the search field above.</p>
          </div>`;
                    return;
                }
                // eslint-disable-next-line no-unsanitized/property
                searchResultsElement.innerHTML =
                    los.getLoadingParagraphHTML('Searching...');
                cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doSearchPastOccupants`, searchFormElement, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    pastOccupantSearchResults = responseJSON.occupants;
                    const panelElement = document.createElement('div');
                    panelElement.className = 'panel';
                    for (const [index, occupant] of pastOccupantSearchResults.entries()) {
                        const panelBlockElement = document.createElement('a');
                        panelBlockElement.className = 'panel-block is-block';
                        panelBlockElement.href = '#';
                        panelBlockElement.dataset.index = index.toString();
                        // eslint-disable-next-line no-unsanitized/property
                        panelBlockElement.innerHTML = `<strong>
                ${cityssm.escapeHTML(occupant.occupantName ?? '')} ${cityssm.escapeHTML(occupant.occupantFamilyName ?? '')}
              </strong><br />
              <div class="columns">
                <div class="column">
                  ${cityssm.escapeHTML(occupant.occupantAddress1 ?? '')}<br />
                  ${(occupant.occupantAddress2 ?? '') === ''
                            ? ''
                            : `${cityssm.escapeHTML(occupant.occupantAddress2 ?? '')}<br />`}${cityssm.escapeHTML(occupant.occupantCity ?? '')}, ${cityssm.escapeHTML(occupant.occupantProvince ?? '')}<br />
                  ${cityssm.escapeHTML(occupant.occupantPostalCode ?? '')}
                </div>
                <div class="column">
                ${(occupant.occupantPhoneNumber ?? '') === ''
                            ? ''
                            : `${cityssm.escapeHTML(occupant.occupantPhoneNumber ?? '')}<br />`}
                ${cityssm.escapeHTML(occupant.occupantEmailAddress ?? '')}<br />
                </div>
                </div>`;
                        panelBlockElement.addEventListener('click', addOccupantFromCopy);
                        panelElement.append(panelBlockElement);
                    }
                    searchResultsElement.innerHTML = '';
                    searchResultsElement.append(panelElement);
                });
            }
            cityssm.openHtmlModal('lotOccupancy-addOccupant', {
                onshow(modalElement) {
                    los.populateAliases(modalElement);
                    modalElement.querySelector('#lotOccupancyOccupantAdd--lotOccupancyId').value = lotOccupancyId;
                    const lotOccupantTypeSelectElement = modalElement.querySelector('#lotOccupancyOccupantAdd--lotOccupantTypeId');
                    const lotOccupantTypeCopySelectElement = modalElement.querySelector('#lotOccupancyOccupantCopy--lotOccupantTypeId');
                    for (const lotOccupantType of exports.lotOccupantTypes) {
                        const optionElement = document.createElement('option');
                        optionElement.value = lotOccupantType.lotOccupantTypeId.toString();
                        optionElement.textContent = lotOccupantType.lotOccupantType;
                        optionElement.dataset.occupantCommentTitle =
                            lotOccupantType.occupantCommentTitle;
                        optionElement.dataset.fontAwesomeIconClass =
                            lotOccupantType.fontAwesomeIconClass;
                        lotOccupantTypeSelectElement.append(optionElement);
                        lotOccupantTypeCopySelectElement.append(optionElement.cloneNode(true));
                    }
                    ;
                    modalElement.querySelector('#lotOccupancyOccupantAdd--occupantCity').value = exports.occupantCityDefault;
                    modalElement.querySelector('#lotOccupancyOccupantAdd--occupantProvince').value = exports.occupantProvinceDefault;
                },
                onshown(modalElement, closeModalFunction) {
                    bulmaJS.toggleHtmlClipped();
                    bulmaJS.init(modalElement);
                    const lotOccupantTypeIdElement = modalElement.querySelector('#lotOccupancyOccupantAdd--lotOccupantTypeId');
                    lotOccupantTypeIdElement.focus();
                    lotOccupantTypeIdElement.addEventListener('change', () => {
                        const fontAwesomeIconClass = lotOccupantTypeIdElement.selectedOptions[0].dataset
                            .fontAwesomeIconClass ?? 'user';
                        modalElement.querySelector('#lotOccupancyOccupantAdd--fontAwesomeIconClass').innerHTML =
                            `<i class="fas fa-fw fa-${cityssm.escapeHTML(fontAwesomeIconClass)}" aria-hidden="true"></i>`;
                        let occupantCommentTitle = lotOccupantTypeIdElement.selectedOptions[0].dataset
                            .occupantCommentTitle ?? '';
                        if (occupantCommentTitle === '') {
                            occupantCommentTitle = 'Comment';
                        }
                        ;
                        modalElement.querySelector('#lotOccupancyOccupantAdd--occupantCommentTitle').textContent = occupantCommentTitle;
                    });
                    addFormElement = modalElement.querySelector('#form--lotOccupancyOccupantAdd');
                    addFormElement.addEventListener('submit', addOccupantFromForm);
                    searchResultsElement = modalElement.querySelector('#lotOccupancyOccupantCopy--searchResults');
                    searchFormElement = modalElement.querySelector('#form--lotOccupancyOccupantCopy');
                    searchFormElement.addEventListener('submit', (formEvent) => {
                        formEvent.preventDefault();
                    });
                    modalElement.querySelector('#lotOccupancyOccupantCopy--searchFilter').addEventListener('change', searchOccupants);
                    addCloseModalFunction = closeModalFunction;
                },
                onremoved() {
                    bulmaJS.toggleHtmlClipped();
                    document.querySelector('#button--addOccupant').focus();
                }
            });
        });
    })();
    if (!isCreate) {
        /**
         * Comments
         */
        ;
        (() => {
            let lotOccupancyComments = exports.lotOccupancyComments;
            delete exports.lotOccupancyComments;
            function openEditLotOccupancyComment(clickEvent) {
                const lotOccupancyCommentId = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
                    .lotOccupancyCommentId ?? '', 10);
                const lotOccupancyComment = lotOccupancyComments.find((currentLotOccupancyComment) => {
                    return (currentLotOccupancyComment.lotOccupancyCommentId ===
                        lotOccupancyCommentId);
                });
                let editFormElement;
                let editCloseModalFunction;
                function editComment(submitEvent) {
                    submitEvent.preventDefault();
                    cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doUpdateLotOccupancyComment`, editFormElement, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            lotOccupancyComments = responseJSON.lotOccupancyComments ?? [];
                            editCloseModalFunction();
                            renderLotOccupancyComments();
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Updating Comment',
                                message: responseJSON.errorMessage ?? '',
                                contextualColorName: 'danger'
                            });
                        }
                    });
                }
                cityssm.openHtmlModal('lotOccupancy-editComment', {
                    onshow(modalElement) {
                        los.populateAliases(modalElement);
                        modalElement.querySelector('#lotOccupancyCommentEdit--lotOccupancyId').value = lotOccupancyId;
                        modalElement.querySelector('#lotOccupancyCommentEdit--lotOccupancyCommentId').value = lotOccupancyCommentId.toString();
                        modalElement.querySelector('#lotOccupancyCommentEdit--lotOccupancyComment').value = lotOccupancyComment.lotOccupancyComment ?? '';
                        const lotOccupancyCommentDateStringElement = modalElement.querySelector('#lotOccupancyCommentEdit--lotOccupancyCommentDateString');
                        lotOccupancyCommentDateStringElement.value =
                            lotOccupancyComment.lotOccupancyCommentDateString ?? '';
                        const currentDateString = cityssm.dateToString(new Date());
                        lotOccupancyCommentDateStringElement.max =
                            lotOccupancyComment.lotOccupancyCommentDateString <=
                                currentDateString
                                ? currentDateString
                                : lotOccupancyComment.lotOccupancyCommentDateString ?? '';
                        modalElement.querySelector('#lotOccupancyCommentEdit--lotOccupancyCommentTimeString').value = lotOccupancyComment.lotOccupancyCommentTimeString ?? '';
                    },
                    onshown(modalElement, closeModalFunction) {
                        bulmaJS.toggleHtmlClipped();
                        los.initializeDatePickers(modalElement);
                        modalElement.querySelector('#lotOccupancyCommentEdit--lotOccupancyComment').focus();
                        editFormElement = modalElement.querySelector('form');
                        editFormElement.addEventListener('submit', editComment);
                        editCloseModalFunction = closeModalFunction;
                    },
                    onremoved() {
                        bulmaJS.toggleHtmlClipped();
                    }
                });
            }
            function deleteLotOccupancyComment(clickEvent) {
                const lotOccupancyCommentId = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
                    .lotOccupancyCommentId ?? '', 10);
                function doDelete() {
                    cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doDeleteLotOccupancyComment`, {
                        lotOccupancyId,
                        lotOccupancyCommentId
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            lotOccupancyComments = responseJSON.lotOccupancyComments;
                            renderLotOccupancyComments();
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Removing Comment',
                                message: responseJSON.errorMessage ?? '',
                                contextualColorName: 'danger'
                            });
                        }
                    });
                }
                bulmaJS.confirm({
                    title: 'Remove Comment?',
                    message: 'Are you sure you want to remove this comment?',
                    okButton: {
                        text: 'Yes, Remove Comment',
                        callbackFunction: doDelete
                    },
                    contextualColorName: 'warning'
                });
            }
            function renderLotOccupancyComments() {
                const containerElement = document.querySelector('#container--lotOccupancyComments');
                if (lotOccupancyComments.length === 0) {
                    containerElement.innerHTML = `<div class="message is-info">
      <p class="message-body">There are no comments associated with this record.</p>
      </div>`;
                    return;
                }
                const tableElement = document.createElement('table');
                tableElement.className = 'table is-fullwidth is-striped is-hoverable';
                tableElement.innerHTML = `<thead><tr>
    <th>Commentor</th>
    <th>Comment Date</th>
    <th>Comment</th>
    <th class="is-hidden-print"><span class="is-sr-only">Options</span></th>
    </tr></thead>
    <tbody></tbody>`;
                for (const lotOccupancyComment of lotOccupancyComments) {
                    const tableRowElement = document.createElement('tr');
                    tableRowElement.dataset.lotOccupancyCommentId =
                        lotOccupancyComment.lotOccupancyCommentId?.toString();
                    tableRowElement.innerHTML = `<td>${cityssm.escapeHTML(lotOccupancyComment.recordCreate_userName ?? '')}</td>
      <td>
      ${cityssm.escapeHTML(lotOccupancyComment.lotOccupancyCommentDateString ?? '')}
      ${cityssm.escapeHTML(lotOccupancyComment.lotOccupancyCommentTime === 0
                        ? ''
                        : lotOccupancyComment.lotOccupancyCommentTimePeriodString ?? '')}
      </td>
      <td>${cityssm.escapeHTML(lotOccupancyComment.lotOccupancyComment ?? '')}</td>
      <td class="is-hidden-print">
        <div class="buttons are-small is-justify-content-end">
        <button class="button is-primary button--edit" type="button">
          <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
          <span>Edit</span>
        </button>
        <button class="button is-light is-danger button--delete" data-tooltip="Delete Comment" type="button" aria-label="Delete">
          <i class="fas fa-trash" aria-hidden="true"></i>
        </button>
        </div>
      </td>`;
                    tableRowElement
                        .querySelector('.button--edit')
                        ?.addEventListener('click', openEditLotOccupancyComment);
                    tableRowElement
                        .querySelector('.button--delete')
                        ?.addEventListener('click', deleteLotOccupancyComment);
                    tableElement.querySelector('tbody')?.append(tableRowElement);
                }
                containerElement.innerHTML = '';
                containerElement.append(tableElement);
            }
            document
                .querySelector('#button--addComment')
                ?.addEventListener('click', () => {
                let addFormElement;
                let addCloseModalFunction;
                function addComment(submitEvent) {
                    submitEvent.preventDefault();
                    cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doAddLotOccupancyComment`, addFormElement, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            lotOccupancyComments = responseJSON.lotOccupancyComments;
                            addCloseModalFunction();
                            renderLotOccupancyComments();
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Adding Comment',
                                message: responseJSON.errorMessage ?? '',
                                contextualColorName: 'danger'
                            });
                        }
                    });
                }
                cityssm.openHtmlModal('lotOccupancy-addComment', {
                    onshow(modalElement) {
                        los.populateAliases(modalElement);
                        modalElement.querySelector('#lotOccupancyCommentAdd--lotOccupancyId').value = lotOccupancyId;
                    },
                    onshown(modalElement, closeModalFunction) {
                        bulmaJS.toggleHtmlClipped();
                        modalElement.querySelector('#lotOccupancyCommentAdd--lotOccupancyComment').focus();
                        addFormElement = modalElement.querySelector('form');
                        addFormElement.addEventListener('submit', addComment);
                        addCloseModalFunction = closeModalFunction;
                    },
                    onremoved: () => {
                        bulmaJS.toggleHtmlClipped();
                        document.querySelector('#button--addComment').focus();
                    }
                });
            });
            renderLotOccupancyComments();
        })();
        (() => {
            let lotOccupancyFees = exports.lotOccupancyFees;
            delete exports.lotOccupancyFees;
            const lotOccupancyFeesContainerElement = document.querySelector('#container--lotOccupancyFees');
            function getFeeGrandTotal() {
                let feeGrandTotal = 0;
                for (const lotOccupancyFee of lotOccupancyFees) {
                    feeGrandTotal +=
                        ((lotOccupancyFee.feeAmount ?? 0) +
                            (lotOccupancyFee.taxAmount ?? 0)) *
                            (lotOccupancyFee.quantity ?? 0);
                }
                return feeGrandTotal;
            }
            function editLotOccupancyFeeQuantity(clickEvent) {
                const feeId = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
                    .feeId ?? '', 10);
                const fee = lotOccupancyFees.find((possibleFee) => {
                    return possibleFee.feeId === feeId;
                });
                let updateCloseModalFunction;
                function doUpdateQuantity(formEvent) {
                    formEvent.preventDefault();
                    cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doUpdateLotOccupancyFeeQuantity`, formEvent.currentTarget, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            lotOccupancyFees = responseJSON.lotOccupancyFees;
                            renderLotOccupancyFees();
                            updateCloseModalFunction();
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Updating Quantity',
                                message: 'Please try again.',
                                contextualColorName: 'danger'
                            });
                        }
                    });
                }
                cityssm.openHtmlModal('lotOccupancy-editFeeQuantity', {
                    onshow(modalElement) {
                        ;
                        modalElement.querySelector('#lotOccupancyFeeQuantity--lotOccupancyId').value = lotOccupancyId;
                        modalElement.querySelector('#lotOccupancyFeeQuantity--feeId').value = fee.feeId.toString();
                        modalElement.querySelector('#lotOccupancyFeeQuantity--quantity').valueAsNumber = fee.quantity ?? 0;
                        modalElement.querySelector('#lotOccupancyFeeQuantity--quantityUnit').textContent = fee.quantityUnit ?? '';
                    },
                    onshown(modalElement, closeModalFunction) {
                        bulmaJS.toggleHtmlClipped();
                        updateCloseModalFunction = closeModalFunction;
                        modalElement.querySelector('#lotOccupancyFeeQuantity--quantity').focus();
                        modalElement
                            .querySelector('form')
                            ?.addEventListener('submit', doUpdateQuantity);
                    },
                    onremoved() {
                        bulmaJS.toggleHtmlClipped();
                    }
                });
            }
            function deleteLotOccupancyFee(clickEvent) {
                const feeId = clickEvent.currentTarget.closest('.container--lotOccupancyFee').dataset.feeId;
                function doDelete() {
                    cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doDeleteLotOccupancyFee`, {
                        lotOccupancyId,
                        feeId
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            lotOccupancyFees = responseJSON.lotOccupancyFees;
                            renderLotOccupancyFees();
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Deleting Fee',
                                message: responseJSON.errorMessage ?? '',
                                contextualColorName: 'danger'
                            });
                        }
                    });
                }
                bulmaJS.confirm({
                    title: 'Delete Fee',
                    message: 'Are you sure you want to delete this fee?',
                    contextualColorName: 'warning',
                    okButton: {
                        text: 'Yes, Delete Fee',
                        callbackFunction: doDelete
                    }
                });
            }
            function renderLotOccupancyFees() {
                if (lotOccupancyFees.length === 0) {
                    lotOccupancyFeesContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no fees associated with this record.</p>
        </div>`;
                    renderLotOccupancyTransactions();
                    return;
                }
                // eslint-disable-next-line no-secrets/no-secrets
                lotOccupancyFeesContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
      <thead><tr>
        <th>Fee</th>
        <th><span class="is-sr-only">Unit Cost</span></th>
        <th class="has-width-1"><span class="is-sr-only">&times;</span></th>
        <th class="has-width-1"><span class="is-sr-only">Quantity</span></th>
        <th class="has-width-1"><span class="is-sr-only">equals</span></th>
        <th class="has-width-1 has-text-right">Total</th>
        <th class="has-width-1 is-hidden-print"><span class="is-sr-only">Options</span></th>
      </tr></thead>
      <tbody></tbody>
      <tfoot><tr>
        <th colspan="5">Subtotal</th>
        <td class="has-text-weight-bold has-text-right" id="lotOccupancyFees--feeAmountTotal"></td>
        <td class="is-hidden-print"></td>
      </tr><tr>
        <th colspan="5">Tax</th>
        <td class="has-text-right" id="lotOccupancyFees--taxAmountTotal"></td>
        <td class="is-hidden-print"></td>
      </tr><tr>
        <th colspan="5">Grand Total</th>
        <td class="has-text-weight-bold has-text-right" id="lotOccupancyFees--grandTotal"></td>
        <td class="is-hidden-print"></td>
      </tr></tfoot></table>`;
                let feeAmountTotal = 0;
                let taxAmountTotal = 0;
                for (const lotOccupancyFee of lotOccupancyFees) {
                    const tableRowElement = document.createElement('tr');
                    tableRowElement.className = 'container--lotOccupancyFee';
                    tableRowElement.dataset.feeId = lotOccupancyFee.feeId.toString();
                    tableRowElement.dataset.includeQuantity =
                        lotOccupancyFee.includeQuantity ?? false ? '1' : '0';
                    // eslint-disable-next-line no-unsanitized/property
                    tableRowElement.innerHTML = `<td colspan="${lotOccupancyFee.quantity === 1 ? '5' : '1'}">
      ${cityssm.escapeHTML(lotOccupancyFee.feeName ?? '')}<br />
      <span class="tag">${cityssm.escapeHTML(lotOccupancyFee.feeCategory ?? '')}</span>
      </td>
      ${lotOccupancyFee.quantity === 1
                        ? ''
                        : `<td class="has-text-right">
              $${lotOccupancyFee.feeAmount?.toFixed(2)}
              </td>
              <td>&times;</td>
              <td class="has-text-right">${lotOccupancyFee.quantity?.toString()}</td>
              <td>=</td>`}
      <td class="has-text-right">
        $${((lotOccupancyFee.feeAmount ?? 0) * (lotOccupancyFee.quantity ?? 0)).toFixed(2)}
      </td>
      <td class="is-hidden-print">
      <div class="buttons are-small is-flex-wrap-nowrap is-justify-content-end">
      ${lotOccupancyFee.includeQuantity ?? false
                        ? `<button class="button is-primary button--editQuantity">
              <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
              <span>Edit</span>
              </button>`
                        : ''}
      <button class="button is-danger is-light button--delete" data-tooltip="Delete Fee" type="button">
        <i class="fas fa-trash" aria-hidden="true"></i>
      </button>
      </div>
      </td>`;
                    tableRowElement
                        .querySelector('.button--editQuantity')
                        ?.addEventListener('click', editLotOccupancyFeeQuantity);
                    tableRowElement
                        .querySelector('.button--delete')
                        ?.addEventListener('click', deleteLotOccupancyFee);
                    lotOccupancyFeesContainerElement
                        .querySelector('tbody')
                        ?.append(tableRowElement);
                    feeAmountTotal +=
                        (lotOccupancyFee.feeAmount ?? 0) * (lotOccupancyFee.quantity ?? 0);
                    taxAmountTotal +=
                        (lotOccupancyFee.taxAmount ?? 0) * (lotOccupancyFee.quantity ?? 0);
                }
                ;
                lotOccupancyFeesContainerElement.querySelector('#lotOccupancyFees--feeAmountTotal').textContent = `$${feeAmountTotal.toFixed(2)}`;
                lotOccupancyFeesContainerElement.querySelector('#lotOccupancyFees--taxAmountTotal').textContent = `$${taxAmountTotal.toFixed(2)}`;
                lotOccupancyFeesContainerElement.querySelector('#lotOccupancyFees--grandTotal').textContent = `$${(feeAmountTotal + taxAmountTotal).toFixed(2)}`;
                renderLotOccupancyTransactions();
            }
            const addFeeButtonElement = document.querySelector('#button--addFee');
            addFeeButtonElement.addEventListener('click', () => {
                if (los.hasUnsavedChanges()) {
                    bulmaJS.alert({
                        message: 'Please save all unsaved changes before adding fees.',
                        contextualColorName: 'warning'
                    });
                    return;
                }
                let feeCategories;
                let feeFilterElement;
                let feeFilterResultsElement;
                function doAddFeeCategory(clickEvent) {
                    clickEvent.preventDefault();
                    const feeCategoryId = Number.parseInt(clickEvent.currentTarget.dataset.feeCategoryId ??
                        '', 10);
                    cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doAddLotOccupancyFeeCategory`, {
                        lotOccupancyId,
                        feeCategoryId
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            lotOccupancyFees = responseJSON.lotOccupancyFees;
                            renderLotOccupancyFees();
                            bulmaJS.alert({
                                message: 'Fee Group Added Successfully',
                                contextualColorName: 'success'
                            });
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Adding Fee',
                                message: responseJSON.errorMessage ?? '',
                                contextualColorName: 'danger'
                            });
                        }
                    });
                }
                function doAddFee(feeId, quantity = 1) {
                    cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doAddLotOccupancyFee`, {
                        lotOccupancyId,
                        feeId,
                        quantity
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            lotOccupancyFees = responseJSON.lotOccupancyFees;
                            renderLotOccupancyFees();
                            filterFees();
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Adding Fee',
                                message: responseJSON.errorMessage ?? '',
                                contextualColorName: 'danger'
                            });
                        }
                    });
                }
                function doSetQuantityAndAddFee(fee) {
                    let quantityElement;
                    let quantityCloseModalFunction;
                    function doSetQuantity(submitEvent) {
                        submitEvent.preventDefault();
                        doAddFee(fee.feeId, quantityElement.value);
                        quantityCloseModalFunction();
                    }
                    cityssm.openHtmlModal('lotOccupancy-setFeeQuantity', {
                        onshow(modalElement) {
                            ;
                            modalElement.querySelector('#lotOccupancyFeeQuantity--quantityUnit').textContent = fee.quantityUnit ?? '';
                        },
                        onshown(modalElement, closeModalFunction) {
                            quantityCloseModalFunction = closeModalFunction;
                            quantityElement = modalElement.querySelector('#lotOccupancyFeeQuantity--quantity');
                            modalElement
                                .querySelector('form')
                                ?.addEventListener('submit', doSetQuantity);
                        }
                    });
                }
                function tryAddFee(clickEvent) {
                    clickEvent.preventDefault();
                    const feeId = Number.parseInt(clickEvent.currentTarget.dataset.feeId ?? '', 10);
                    const feeCategoryId = Number.parseInt(clickEvent.currentTarget.dataset.feeCategoryId ??
                        '', 10);
                    const feeCategory = feeCategories.find((currentFeeCategory) => {
                        return currentFeeCategory.feeCategoryId === feeCategoryId;
                    });
                    const fee = feeCategory.fees.find((currentFee) => {
                        return currentFee.feeId === feeId;
                    });
                    if (fee.includeQuantity ?? false) {
                        doSetQuantityAndAddFee(fee);
                    }
                    else {
                        doAddFee(feeId);
                    }
                }
                function filterFees() {
                    const filterStringPieces = feeFilterElement.value
                        .trim()
                        .toLowerCase()
                        .split(' ');
                    feeFilterResultsElement.innerHTML = '';
                    for (const feeCategory of feeCategories) {
                        const categoryContainerElement = document.createElement('div');
                        categoryContainerElement.className = 'container--feeCategory';
                        categoryContainerElement.dataset.feeCategoryId =
                            feeCategory.feeCategoryId.toString();
                        categoryContainerElement.innerHTML = `<div class="columns is-vcentered">
        <div class="column">
          <h4 class="title is-5">
          ${cityssm.escapeHTML(feeCategory.feeCategory ?? '')}
          </h4>
        </div>
        </div>
        <div class="panel mb-5"></div>`;
                        if (feeCategory.isGroupedFee) {
                            // eslint-disable-next-line no-unsanitized/method
                            categoryContainerElement
                                .querySelector('.columns')
                                ?.insertAdjacentHTML('beforeend', `<div class="column is-narrow has-text-right">
                    <button class="button is-small is-success" type="button" data-fee-category-id="${feeCategory.feeCategoryId}">
                      <span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>
                      <span>Add Fee Group</span>
                    </button>
                    </div>`);
                            categoryContainerElement
                                .querySelector('button')
                                ?.addEventListener('click', doAddFeeCategory);
                        }
                        let hasFees = false;
                        for (const fee of feeCategory.fees) {
                            // Don't include already applied fees that limit quantity
                            if (lotOccupancyFeesContainerElement.querySelector(`.container--lotOccupancyFee[data-fee-id='${fee.feeId}'][data-include-quantity='0']`) !== null) {
                                continue;
                            }
                            let includeFee = true;
                            const feeSearchString = `${feeCategory.feeCategory ?? ''} ${fee.feeName ?? ''} ${fee.feeDescription ?? ''}`.toLowerCase();
                            for (const filterStringPiece of filterStringPieces) {
                                if (!feeSearchString.includes(filterStringPiece)) {
                                    includeFee = false;
                                    break;
                                }
                            }
                            if (!includeFee) {
                                continue;
                            }
                            hasFees = true;
                            const panelBlockElement = document.createElement(feeCategory.isGroupedFee ? 'div' : 'a');
                            panelBlockElement.className =
                                'panel-block is-block container--fee';
                            panelBlockElement.dataset.feeId = fee.feeId.toString();
                            panelBlockElement.dataset.feeCategoryId =
                                feeCategory.feeCategoryId.toString();
                            // eslint-disable-next-line no-unsanitized/property
                            panelBlockElement.innerHTML = `<strong>${cityssm.escapeHTML(fee.feeName ?? '')}</strong><br />
          <small>
          ${
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                            cityssm
                                .escapeHTML(fee.feeDescription ?? '')
                                .replaceAll('\n', '<br />')}
          </small>`;
                            if (!feeCategory.isGroupedFee) {
                                ;
                                panelBlockElement.href = '#';
                                panelBlockElement.addEventListener('click', tryAddFee);
                            }
                            ;
                            categoryContainerElement.querySelector('.panel').append(panelBlockElement);
                        }
                        if (hasFees) {
                            feeFilterResultsElement.append(categoryContainerElement);
                        }
                    }
                }
                cityssm.openHtmlModal('lotOccupancy-addFee', {
                    onshow(modalElement) {
                        feeFilterElement = modalElement.querySelector('#feeSelect--feeName');
                        feeFilterResultsElement = modalElement.querySelector('#resultsContainer--feeSelect');
                        cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doGetFees`, {
                            lotOccupancyId
                        }, (rawResponseJSON) => {
                            const responseJSON = rawResponseJSON;
                            feeCategories = responseJSON.feeCategories;
                            feeFilterElement.disabled = false;
                            feeFilterElement.addEventListener('keyup', filterFees);
                            feeFilterElement.focus();
                            filterFees();
                        });
                    },
                    onshown() {
                        bulmaJS.toggleHtmlClipped();
                    },
                    onhidden() {
                        renderLotOccupancyFees();
                    },
                    onremoved() {
                        bulmaJS.toggleHtmlClipped();
                        addFeeButtonElement.focus();
                    }
                });
            });
            let lotOccupancyTransactions = exports.lotOccupancyTransactions;
            delete exports.lotOccupancyTransactions;
            const lotOccupancyTransactionsContainerElement = document.querySelector('#container--lotOccupancyTransactions');
            function getTransactionGrandTotal() {
                let transactionGrandTotal = 0;
                for (const lotOccupancyTransaction of lotOccupancyTransactions) {
                    transactionGrandTotal += lotOccupancyTransaction.transactionAmount;
                }
                return transactionGrandTotal;
            }
            function editLotOccupancyTransaction(clickEvent) {
                const transactionIndex = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
                    .transactionIndex ?? '', 10);
                const transaction = lotOccupancyTransactions.find((possibleTransaction) => {
                    return possibleTransaction.transactionIndex === transactionIndex;
                });
                let editCloseModalFunction;
                function doEdit(formEvent) {
                    formEvent.preventDefault();
                    cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doUpdateLotOccupancyTransaction`, formEvent.currentTarget, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            lotOccupancyTransactions = responseJSON.lotOccupancyTransactions;
                            renderLotOccupancyTransactions();
                            editCloseModalFunction();
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Updating Transaction',
                                message: 'Please try again.',
                                contextualColorName: 'danger'
                            });
                        }
                    });
                }
                cityssm.openHtmlModal('lotOccupancy-editTransaction', {
                    onshow(modalElement) {
                        los.populateAliases(modalElement);
                        modalElement.querySelector('#lotOccupancyTransactionEdit--lotOccupancyId').value = lotOccupancyId;
                        modalElement.querySelector('#lotOccupancyTransactionEdit--transactionIndex').value = transaction.transactionIndex?.toString() ?? '';
                        modalElement.querySelector('#lotOccupancyTransactionEdit--transactionAmount').value = transaction.transactionAmount.toFixed(2);
                        modalElement.querySelector('#lotOccupancyTransactionEdit--externalReceiptNumber').value = transaction.externalReceiptNumber ?? '';
                        modalElement.querySelector('#lotOccupancyTransactionEdit--transactionNote').value = transaction.transactionNote ?? '';
                        modalElement.querySelector('#lotOccupancyTransactionEdit--transactionDateString').value = transaction.transactionDateString ?? '';
                        modalElement.querySelector('#lotOccupancyTransactionEdit--transactionTimeString').value = transaction.transactionTimeString ?? '';
                    },
                    onshown(modalElement, closeModalFunction) {
                        bulmaJS.toggleHtmlClipped();
                        los.initializeDatePickers(modalElement);
                        modalElement.querySelector('#lotOccupancyTransactionEdit--transactionAmount').focus();
                        modalElement
                            .querySelector('form')
                            ?.addEventListener('submit', doEdit);
                        editCloseModalFunction = closeModalFunction;
                    },
                    onremoved() {
                        bulmaJS.toggleHtmlClipped();
                    }
                });
            }
            function deleteLotOccupancyTransaction(clickEvent) {
                const transactionIndex = clickEvent.currentTarget.closest('.container--lotOccupancyTransaction').dataset.transactionIndex;
                function doDelete() {
                    cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doDeleteLotOccupancyTransaction`, {
                        lotOccupancyId,
                        transactionIndex
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            lotOccupancyTransactions = responseJSON.lotOccupancyTransactions;
                            renderLotOccupancyTransactions();
                        }
                        else {
                            bulmaJS.alert({
                                title: 'Error Deleting Transaction',
                                message: responseJSON.errorMessage ?? '',
                                contextualColorName: 'danger'
                            });
                        }
                    });
                }
                bulmaJS.confirm({
                    title: 'Delete Transaction',
                    message: 'Are you sure you want to delete this transaction?',
                    contextualColorName: 'warning',
                    okButton: {
                        text: 'Yes, Delete Transaction',
                        callbackFunction: doDelete
                    }
                });
            }
            function renderLotOccupancyTransactions() {
                if (lotOccupancyTransactions.length === 0) {
                    // eslint-disable-next-line no-unsanitized/property
                    lotOccupancyTransactionsContainerElement.innerHTML = `<div class="message ${lotOccupancyFees.length === 0 ? 'is-info' : 'is-warning'}">
      <p class="message-body">There are no transactions associated with this record.</p>
      </div>`;
                    return;
                }
                // eslint-disable-next-line no-unsanitized/property
                lotOccupancyTransactionsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
      <thead><tr>
        <th class="has-width-1">Date</th>
        <th>${los.escapedAliases.ExternalReceiptNumber}</th>
        <th class="has-text-right has-width-1">Amount</th>
        <th class="has-width-1 is-hidden-print"><span class="is-sr-only">Options</span></th>
      </tr></thead>
      <tbody></tbody>
      <tfoot><tr>
        <th colspan="2">Transaction Total</th>
        <td class="has-text-weight-bold has-text-right" id="lotOccupancyTransactions--grandTotal"></td>
        <td class="is-hidden-print"></td>
      </tr></tfoot>
      </table>`;
                let transactionGrandTotal = 0;
                for (const lotOccupancyTransaction of lotOccupancyTransactions) {
                    transactionGrandTotal += lotOccupancyTransaction.transactionAmount;
                    const tableRowElement = document.createElement('tr');
                    tableRowElement.className = 'container--lotOccupancyTransaction';
                    tableRowElement.dataset.transactionIndex =
                        lotOccupancyTransaction.transactionIndex?.toString();
                    let externalReceiptNumberHTML = '';
                    if (lotOccupancyTransaction.externalReceiptNumber !== '') {
                        externalReceiptNumberHTML = cityssm.escapeHTML(lotOccupancyTransaction.externalReceiptNumber ?? '');
                        if (los.dynamicsGPIntegrationIsEnabled) {
                            if (lotOccupancyTransaction.dynamicsGPDocument === undefined) {
                                externalReceiptNumberHTML += ` <span data-tooltip="No Matching Document Found">
            <i class="fas fa-times-circle has-text-danger" aria-label="No Matching Document Found"></i>
            </span>`;
                            }
                            else if (lotOccupancyTransaction.dynamicsGPDocument.documentTotal.toFixed(2) === lotOccupancyTransaction.transactionAmount.toFixed(2)) {
                                externalReceiptNumberHTML += ` <span data-tooltip="Matching Document Found">
            <i class="fas fa-check-circle has-text-success" aria-label="Matching Document Found"></i>
            </span>`;
                            }
                            else {
                                externalReceiptNumberHTML += ` <span data-tooltip="Matching Document: $${lotOccupancyTransaction.dynamicsGPDocument.documentTotal.toFixed(2)}">
            <i class="fas fa-check-circle has-text-warning" aria-label="Matching Document: $${lotOccupancyTransaction.dynamicsGPDocument.documentTotal.toFixed(2)}"></i>
            </span>`;
                            }
                        }
                        externalReceiptNumberHTML += '<br />';
                    }
                    // eslint-disable-next-line no-unsanitized/property
                    tableRowElement.innerHTML = `<td>
      ${cityssm.escapeHTML(lotOccupancyTransaction.transactionDateString ?? '')}
      </td>
      <td>
        ${externalReceiptNumberHTML}
        <small>${cityssm.escapeHTML(lotOccupancyTransaction.transactionNote ?? '')}</small>
      </td>
      <td class="has-text-right">
        $${cityssm.escapeHTML(lotOccupancyTransaction.transactionAmount.toFixed(2))}
      </td>
      <td class="is-hidden-print">
        <div class="buttons are-small is-flex-wrap-nowrap is-justify-content-end">
          <button class="button is-primary button--edit" type="button">
            <span class="icon"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
            <span>Edit</span>
          </button>
          <button class="button is-danger is-light button--delete" data-tooltip="Delete Transaction" type="button">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      </td>`;
                    tableRowElement
                        .querySelector('.button--edit')
                        ?.addEventListener('click', editLotOccupancyTransaction);
                    tableRowElement
                        .querySelector('.button--delete')
                        ?.addEventListener('click', deleteLotOccupancyTransaction);
                    lotOccupancyTransactionsContainerElement
                        .querySelector('tbody')
                        ?.append(tableRowElement);
                }
                ;
                lotOccupancyTransactionsContainerElement.querySelector('#lotOccupancyTransactions--grandTotal').textContent = `$${transactionGrandTotal.toFixed(2)}`;
                const feeGrandTotal = getFeeGrandTotal();
                if (feeGrandTotal.toFixed(2) !== transactionGrandTotal.toFixed(2)) {
                    lotOccupancyTransactionsContainerElement.insertAdjacentHTML('afterbegin', `<div class="message is-warning">
        <div class="message-body">
        <div class="level">
          <div class="level-left">
            <div class="level-item">Outstanding Balance</div>
          </div>
          <div class="level-right">
            <div class="level-item">
              $${cityssm.escapeHTML((feeGrandTotal - transactionGrandTotal).toFixed(2))}
            </div>
          </div>
        </div>
        </div></div>`);
                }
            }
            const addTransactionButtonElement = document.querySelector('#button--addTransaction');
            addTransactionButtonElement.addEventListener('click', () => {
                let transactionAmountElement;
                let externalReceiptNumberElement;
                let addCloseModalFunction;
                function doAddTransaction(submitEvent) {
                    submitEvent.preventDefault();
                    cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doAddLotOccupancyTransaction`, submitEvent.currentTarget, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (responseJSON.success) {
                            lotOccupancyTransactions = responseJSON.lotOccupancyTransactions;
                            addCloseModalFunction();
                            renderLotOccupancyTransactions();
                        }
                        else {
                            bulmaJS.confirm({
                                title: 'Error Adding Transaction',
                                message: responseJSON.errorMessage ?? '',
                                contextualColorName: 'danger'
                            });
                        }
                    });
                }
                // eslint-disable-next-line @typescript-eslint/naming-convention
                function dynamicsGP_refreshExternalReceiptNumberIcon() {
                    const externalReceiptNumber = externalReceiptNumberElement.value;
                    const iconElement = externalReceiptNumberElement
                        .closest('.control')
                        ?.querySelector('.icon');
                    const helpTextElement = externalReceiptNumberElement
                        .closest('.field')
                        ?.querySelector('.help');
                    if (externalReceiptNumber === '') {
                        helpTextElement.innerHTML = '&nbsp;';
                        iconElement.innerHTML =
                            '<i class="fas fa-minus" aria-hidden="true"></i>';
                        return;
                    }
                    cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doGetDynamicsGPDocument`, {
                        externalReceiptNumber
                    }, (rawResponseJSON) => {
                        const responseJSON = rawResponseJSON;
                        if (!responseJSON.success ||
                            responseJSON.dynamicsGPDocument === undefined) {
                            helpTextElement.textContent = 'No Matching Document Found';
                            iconElement.innerHTML =
                                '<i class="fas fa-times-circle" aria-hidden="true"></i>';
                        }
                        else if (transactionAmountElement.valueAsNumber ===
                            responseJSON.dynamicsGPDocument.documentTotal) {
                            helpTextElement.textContent = 'Matching Document Found';
                            iconElement.innerHTML =
                                '<i class="fas fa-check-circle" aria-hidden="true"></i>';
                        }
                        else {
                            helpTextElement.textContent = `Matching Document: $${responseJSON.dynamicsGPDocument.documentTotal.toFixed(2)}`;
                            iconElement.innerHTML =
                                '<i class="fas fa-exclamation-triangle" aria-hidden="true"></i>';
                        }
                    });
                }
                cityssm.openHtmlModal('lotOccupancy-addTransaction', {
                    onshow(modalElement) {
                        los.populateAliases(modalElement);
                        modalElement.querySelector('#lotOccupancyTransactionAdd--lotOccupancyId').value = lotOccupancyId.toString();
                        const feeGrandTotal = getFeeGrandTotal();
                        const transactionGrandTotal = getTransactionGrandTotal();
                        transactionAmountElement = modalElement.querySelector('#lotOccupancyTransactionAdd--transactionAmount');
                        transactionAmountElement.min = (-1 * transactionGrandTotal).toFixed(2);
                        transactionAmountElement.max = Math.max(feeGrandTotal - transactionGrandTotal, 0).toFixed(2);
                        transactionAmountElement.value = Math.max(feeGrandTotal - transactionGrandTotal, 0).toFixed(2);
                        if (los.dynamicsGPIntegrationIsEnabled) {
                            externalReceiptNumberElement = modalElement.querySelector(
                            // eslint-disable-next-line no-secrets/no-secrets
                            '#lotOccupancyTransactionAdd--externalReceiptNumber');
                            const externalReceiptNumberControlElement = externalReceiptNumberElement.closest('.control');
                            externalReceiptNumberControlElement.classList.add('has-icons-right');
                            externalReceiptNumberControlElement.insertAdjacentHTML('beforeend', '<span class="icon is-small is-right"></span>');
                            externalReceiptNumberControlElement.insertAdjacentHTML('afterend', '<p class="help has-text-right"></p>');
                            externalReceiptNumberElement.addEventListener('change', dynamicsGP_refreshExternalReceiptNumberIcon);
                            transactionAmountElement.addEventListener('change', dynamicsGP_refreshExternalReceiptNumberIcon);
                            dynamicsGP_refreshExternalReceiptNumberIcon();
                        }
                    },
                    onshown(modalElement, closeModalFunction) {
                        bulmaJS.toggleHtmlClipped();
                        transactionAmountElement.focus();
                        addCloseModalFunction = closeModalFunction;
                        modalElement
                            .querySelector('form')
                            ?.addEventListener('submit', doAddTransaction);
                    },
                    onremoved() {
                        bulmaJS.toggleHtmlClipped();
                        addTransactionButtonElement.focus();
                    }
                });
            });
            renderLotOccupancyFees();
        })();
    }
})();

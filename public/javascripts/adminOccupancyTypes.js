"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const los = exports.los;
    const occupancyTypesContainerElement = document.querySelector('#container--occupancyTypes');
    const ContractTypePrintsContainerElement = document.querySelector('#container--ContractTypePrints');
    let occupancyTypes = exports.occupancyTypes;
    delete exports.occupancyTypes;
    let allOccupancyTypeFields = exports.allOccupancyTypeFields;
    delete exports.allOccupancyTypeFields;
    const expandedOccupancyTypes = new Set();
    function toggleOccupancyTypeFields(clickEvent) {
        const toggleButtonElement = clickEvent.currentTarget;
        const occupancyTypeElement = toggleButtonElement.closest('.container--occupancyType');
        const occupancyTypeId = Number.parseInt(occupancyTypeElement.dataset.occupancyTypeId ?? '', 10);
        if (expandedOccupancyTypes.has(occupancyTypeId)) {
            expandedOccupancyTypes.delete(occupancyTypeId);
        }
        else {
            expandedOccupancyTypes.add(occupancyTypeId);
        }
        // eslint-disable-next-line no-unsanitized/property
        toggleButtonElement.innerHTML = expandedOccupancyTypes.has(occupancyTypeId)
            ? '<i class="fas fa-fw fa-minus" aria-hidden="true"></i>'
            : '<i class="fas fa-fw fa-plus" aria-hidden="true"></i>';
        const panelBlockElements = occupancyTypeElement.querySelectorAll('.panel-block');
        for (const panelBlockElement of panelBlockElements) {
            panelBlockElement.classList.toggle('is-hidden');
        }
    }
    function occupancyTypeResponseHandler(rawResponseJSON) {
        const responseJSON = rawResponseJSON;
        if (responseJSON.success) {
            occupancyTypes = responseJSON.occupancyTypes;
            allOccupancyTypeFields = responseJSON.allOccupancyTypeFields;
            renderOccupancyTypes();
        }
        else {
            bulmaJS.alert({
                title: `Error Updating ${los.escapedAliases.Occupancy} Type`,
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
            });
        }
    }
    function deleteOccupancyType(clickEvent) {
        const occupancyTypeId = Number.parseInt(clickEvent.currentTarget.closest('.container--occupancyType').dataset.occupancyTypeId ?? '', 10);
        function doDelete() {
            cityssm.postJSON(`${los.urlPrefix}/admin/doDeleteOccupancyType`, {
                occupancyTypeId
            }, occupancyTypeResponseHandler);
        }
        bulmaJS.confirm({
            title: `Delete ${los.escapedAliases.Occupancy} Type`,
            message: `Are you sure you want to delete this ${los.escapedAliases.occupancy} type?`,
            contextualColorName: 'warning',
            okButton: {
                text: `Yes, Delete ${los.escapedAliases.Occupancy} Type`,
                callbackFunction: doDelete
            }
        });
    }
    function openEditOccupancyType(clickEvent) {
        const occupancyTypeId = Number.parseInt(clickEvent.currentTarget.closest('.container--occupancyType').dataset.occupancyTypeId ?? '', 10);
        const occupancyType = occupancyTypes.find((currentOccupancyType) => occupancyTypeId === currentOccupancyType.occupancyTypeId);
        let editCloseModalFunction;
        function doEdit(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${los.urlPrefix}/admin/doUpdateOccupancyType`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                occupancyTypeResponseHandler(responseJSON);
                if (responseJSON.success) {
                    editCloseModalFunction();
                }
            });
        }
        cityssm.openHtmlModal('adminOccupancyTypes-editOccupancyType', {
            onshow(modalElement) {
                los.populateAliases(modalElement);
                modalElement.querySelector('#occupancyTypeEdit--occupancyTypeId').value = occupancyTypeId.toString();
                modalElement.querySelector('#occupancyTypeEdit--occupancyType').value = occupancyType.occupancyType;
            },
            onshown(modalElement, closeModalFunction) {
                editCloseModalFunction = closeModalFunction;
                modalElement.querySelector('#occupancyTypeEdit--occupancyType').focus();
                modalElement.querySelector('form')?.addEventListener('submit', doEdit);
                bulmaJS.toggleHtmlClipped();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function openAddOccupancyTypeField(clickEvent) {
        const occupancyTypeId = Number.parseInt(clickEvent.currentTarget.closest('.container--occupancyType').dataset.occupancyTypeId ?? '', 10);
        let addCloseModalFunction;
        function doAdd(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${los.urlPrefix}/admin/doAddOccupancyTypeField`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                expandedOccupancyTypes.add(occupancyTypeId);
                occupancyTypeResponseHandler(responseJSON);
                if (responseJSON.success) {
                    addCloseModalFunction();
                    openEditOccupancyTypeField(occupancyTypeId, responseJSON.occupancyTypeFieldId ?? 0);
                }
            });
        }
        cityssm.openHtmlModal('adminOccupancyTypes-addOccupancyTypeField', {
            onshow(modalElement) {
                los.populateAliases(modalElement);
                if (occupancyTypeId) {
                    ;
                    modalElement.querySelector('#occupancyTypeFieldAdd--occupancyTypeId').value = occupancyTypeId.toString();
                }
            },
            onshown(modalElement, closeModalFunction) {
                addCloseModalFunction = closeModalFunction;
                modalElement.querySelector('#occupancyTypeFieldAdd--occupancyTypeField').focus();
                modalElement.querySelector('form')?.addEventListener('submit', doAdd);
                bulmaJS.toggleHtmlClipped();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function moveOccupancyType(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const occupancyTypeId = clickEvent.currentTarget.closest('.container--occupancyType').dataset.occupancyTypeId;
        cityssm.postJSON(`${los.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveOccupancyTypeUp'
            : 'doMoveOccupancyTypeDown'}`, {
            occupancyTypeId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, occupancyTypeResponseHandler);
    }
    function openEditOccupancyTypeField(occupancyTypeId, occupancyTypeFieldId) {
        let occupancyType;
        if (occupancyTypeId) {
            occupancyType = occupancyTypes.find((currentOccupancyType) => currentOccupancyType.occupancyTypeId === occupancyTypeId);
        }
        const occupancyTypeField = (occupancyType
            ? occupancyType.occupancyTypeFields ?? []
            : allOccupancyTypeFields).find((currentOccupancyTypeField) => currentOccupancyTypeField.occupancyTypeFieldId === occupancyTypeFieldId);
        let fieldTypeElement;
        let minimumLengthElement;
        let maximumLengthElement;
        let patternElement;
        let occupancyTypeFieldValuesElement;
        let editCloseModalFunction;
        function updateMaximumLengthMin() {
            maximumLengthElement.min = minimumLengthElement.value;
        }
        function toggleInputFields() {
            switch (fieldTypeElement.value) {
                case 'date': {
                    minimumLengthElement.disabled = true;
                    maximumLengthElement.disabled = true;
                    patternElement.disabled = true;
                    occupancyTypeFieldValuesElement.disabled = true;
                    break;
                }
                case 'select': {
                    minimumLengthElement.disabled = true;
                    maximumLengthElement.disabled = true;
                    patternElement.disabled = true;
                    occupancyTypeFieldValuesElement.disabled = false;
                    break;
                }
                default: {
                    minimumLengthElement.disabled = false;
                    maximumLengthElement.disabled = false;
                    patternElement.disabled = false;
                    occupancyTypeFieldValuesElement.disabled = true;
                    break;
                }
            }
        }
        function doUpdate(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${los.urlPrefix}/admin/doUpdateOccupancyTypeField`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                occupancyTypeResponseHandler(responseJSON);
                if (responseJSON.success) {
                    editCloseModalFunction();
                }
            });
        }
        function doDelete() {
            cityssm.postJSON(`${los.urlPrefix}/admin/doDeleteOccupancyTypeField`, {
                occupancyTypeFieldId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                occupancyTypeResponseHandler(responseJSON);
                if (responseJSON.success) {
                    editCloseModalFunction();
                }
            });
        }
        function confirmDoDelete() {
            bulmaJS.confirm({
                title: 'Delete Field',
                message: 'Are you sure you want to delete this field?  Note that historical records that make use of this field will not be affected.',
                contextualColorName: 'warning',
                okButton: {
                    text: 'Yes, Delete Field',
                    callbackFunction: doDelete
                }
            });
        }
        cityssm.openHtmlModal('adminOccupancyTypes-editOccupancyTypeField', {
            onshow: (modalElement) => {
                los.populateAliases(modalElement);
                modalElement.querySelector('#occupancyTypeFieldEdit--occupancyTypeFieldId').value = occupancyTypeField.occupancyTypeFieldId.toString();
                modalElement.querySelector('#occupancyTypeFieldEdit--occupancyTypeField').value = occupancyTypeField.occupancyTypeField ?? '';
                modalElement.querySelector('#occupancyTypeFieldEdit--isRequired').value = occupancyTypeField.isRequired ?? false ? '1' : '0';
                fieldTypeElement = modalElement.querySelector('#occupancyTypeFieldEdit--fieldType');
                fieldTypeElement.value = occupancyTypeField.fieldType;
                minimumLengthElement = modalElement.querySelector('#occupancyTypeFieldEdit--minimumLength');
                minimumLengthElement.value =
                    occupancyTypeField.minimumLength?.toString() ?? '';
                maximumLengthElement = modalElement.querySelector('#occupancyTypeFieldEdit--maximumLength');
                maximumLengthElement.value =
                    occupancyTypeField.maximumLength?.toString() ?? '';
                patternElement = modalElement.querySelector('#occupancyTypeFieldEdit--pattern');
                patternElement.value = occupancyTypeField.pattern ?? '';
                occupancyTypeFieldValuesElement = modalElement.querySelector('#occupancyTypeFieldEdit--occupancyTypeFieldValues');
                occupancyTypeFieldValuesElement.value =
                    occupancyTypeField.occupancyTypeFieldValues ?? '';
                toggleInputFields();
            },
            onshown: (modalElement, closeModalFunction) => {
                editCloseModalFunction = closeModalFunction;
                bulmaJS.init(modalElement);
                bulmaJS.toggleHtmlClipped();
                cityssm.enableNavBlocker();
                modalElement.querySelector('form')?.addEventListener('submit', doUpdate);
                minimumLengthElement.addEventListener('keyup', updateMaximumLengthMin);
                updateMaximumLengthMin();
                fieldTypeElement.addEventListener('change', toggleInputFields);
                modalElement
                    .querySelector('#button--deleteOccupancyTypeField')
                    ?.addEventListener('click', confirmDoDelete);
            },
            onremoved: () => {
                bulmaJS.toggleHtmlClipped();
                cityssm.disableNavBlocker();
            }
        });
    }
    function openEditOccupancyTypeFieldByClick(clickEvent) {
        clickEvent.preventDefault();
        const occupancyTypeFieldId = Number.parseInt(clickEvent.currentTarget.closest('.container--occupancyTypeField').dataset.occupancyTypeFieldId ?? '', 10);
        const occupancyTypeId = Number.parseInt(clickEvent.currentTarget.closest('.container--occupancyType').dataset.occupancyTypeId ?? '', 10);
        openEditOccupancyTypeField(occupancyTypeId, occupancyTypeFieldId);
    }
    function moveOccupancyTypeField(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const occupancyTypeFieldId = clickEvent.currentTarget.closest('.container--occupancyTypeField').dataset.occupancyTypeFieldId;
        cityssm.postJSON(`${los.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveOccupancyTypeFieldUp'
            : // eslint-disable-next-line no-secrets/no-secrets
                'doMoveOccupancyTypeFieldDown'}`, {
            occupancyTypeFieldId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, occupancyTypeResponseHandler);
    }
    function renderOccupancyTypeFields(panelElement, occupancyTypeId, occupancyTypeFields) {
        if (occupancyTypeFields.length === 0) {
            // eslint-disable-next-line no-unsanitized/method
            panelElement.insertAdjacentHTML('beforeend', `<div class="panel-block is-block ${!occupancyTypeId || expandedOccupancyTypes.has(occupancyTypeId)
                ? ''
                : ' is-hidden'}">
        <div class="message is-info"><p class="message-body">There are no additional fields.</p></div>
        </div>`);
        }
        else {
            for (const occupancyTypeField of occupancyTypeFields) {
                const panelBlockElement = document.createElement('div');
                panelBlockElement.className =
                    'panel-block is-block container--occupancyTypeField';
                if (occupancyTypeId && !expandedOccupancyTypes.has(occupancyTypeId)) {
                    panelBlockElement.classList.add('is-hidden');
                }
                panelBlockElement.dataset.occupancyTypeFieldId =
                    occupancyTypeField.occupancyTypeFieldId.toString();
                // eslint-disable-next-line no-unsanitized/property
                panelBlockElement.innerHTML = `<div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <a class="has-text-weight-bold button--editOccupancyTypeField" href="#">
                ${cityssm.escapeHTML(occupancyTypeField.occupancyTypeField ?? '')}
              </a>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              ${los.getMoveUpDownButtonFieldHTML('button--moveOccupancyTypeFieldUp', 'button--moveOccupancyTypeFieldDown')}
            </div>
          </div>
          </div>`;
                panelBlockElement
                    .querySelector('.button--editOccupancyTypeField')
                    ?.addEventListener('click', openEditOccupancyTypeFieldByClick);
                panelBlockElement.querySelector('.button--moveOccupancyTypeFieldUp').addEventListener('click', moveOccupancyTypeField);
                panelBlockElement.querySelector('.button--moveOccupancyTypeFieldDown').addEventListener('click', moveOccupancyTypeField);
                panelElement.append(panelBlockElement);
            }
        }
    }
    function openAddOccupancyTypePrint(clickEvent) {
        const occupancyTypeId = clickEvent.currentTarget.closest('.container--occupancyTypePrintList').dataset.occupancyTypeId ?? '';
        let closeAddModalFunction;
        function doAdd(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${los.urlPrefix}/admin/doAddOccupancyTypePrint`, formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeAddModalFunction();
                }
                occupancyTypeResponseHandler(responseJSON);
            });
        }
        cityssm.openHtmlModal('adminOccupancyTypes-addOccupancyTypePrint', {
            onshow(modalElement) {
                los.populateAliases(modalElement);
                modalElement.querySelector('#occupancyTypePrintAdd--occupancyTypeId').value = occupancyTypeId;
                const printSelectElement = modalElement.querySelector('#occupancyTypePrintAdd--printEJS');
                for (const [printEJS, printTitle] of Object.entries(exports.occupancyTypePrintTitles)) {
                    const optionElement = document.createElement('option');
                    optionElement.value = printEJS;
                    optionElement.textContent = printTitle;
                    printSelectElement.append(optionElement);
                }
            },
            onshown(modalElement, closeModalFunction) {
                closeAddModalFunction = closeModalFunction;
                modalElement.querySelector('form')?.addEventListener('submit', doAdd);
            }
        });
    }
    function moveOccupancyTypePrint(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const printEJS = buttonElement.closest('.container--occupancyTypePrint').dataset.printEJS;
        const occupancyTypeId = buttonElement.closest('.container--occupancyTypePrintList').dataset.occupancyTypeId;
        cityssm.postJSON(`${los.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? // eslint-disable-next-line no-secrets/no-secrets
                'doMoveOccupancyTypePrintUp'
            : // eslint-disable-next-line no-secrets/no-secrets
                'doMoveOccupancyTypePrintDown'}`, {
            occupancyTypeId,
            printEJS,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, occupancyTypeResponseHandler);
    }
    function deleteOccupancyTypePrint(clickEvent) {
        clickEvent.preventDefault();
        const printEJS = clickEvent.currentTarget.closest('.container--occupancyTypePrint').dataset.printEJS;
        const occupancyTypeId = clickEvent.currentTarget.closest('.container--occupancyTypePrintList').dataset.occupancyTypeId;
        function doDelete() {
            cityssm.postJSON(`${los.urlPrefix}/admin/doDeleteOccupancyTypePrint`, {
                occupancyTypeId,
                printEJS
            }, occupancyTypeResponseHandler);
        }
        bulmaJS.confirm({
            title: 'Delete Print',
            message: 'Are you sure you want to remove this print option?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Remove Print',
                callbackFunction: doDelete
            }
        });
    }
    function renderContractTypePrints(panelElement, occupancyTypeId, ContractTypePrints) {
        if (ContractTypePrints.length === 0) {
            panelElement.insertAdjacentHTML('beforeend', `<div class="panel-block is-block">
          <div class="message is-info">
            <p class="message-body">There are no prints associated with this record.</p>
          </div>
          </div>`);
        }
        else {
            for (const printEJS of ContractTypePrints) {
                const panelBlockElement = document.createElement('div');
                panelBlockElement.className =
                    'panel-block is-block container--occupancyTypePrint';
                panelBlockElement.dataset.printEJS = printEJS;
                const printTitle = printEJS === '*'
                    ? '(All Available Prints)'
                    : exports.occupancyTypePrintTitles[printEJS];
                let printIconClass = 'fa-star';
                if (printEJS.startsWith('pdf/')) {
                    printIconClass = 'fa-file-pdf';
                }
                else if (printEJS.startsWith('screen/')) {
                    printIconClass = 'fa-file';
                }
                // eslint-disable-next-line no-unsanitized/property
                panelBlockElement.innerHTML = `<div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <i class="fas fa-fw ${printIconClass}" aria-hidden="true"></i>
            </div>
            <div class="level-item">
              ${cityssm.escapeHTML(printTitle || printEJS)}
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              ${los.getMoveUpDownButtonFieldHTML('button--moveOccupancyTypePrintUp', 'button--moveOccupancyTypePrintDown')}
            </div>
            <div class="level-item">
              <button class="button is-small is-danger button--deleteOccupancyTypePrint" data-tooltip="Delete" type="button" aria-label="Delete Print">
                <i class="fas fa-trash" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          </div>`;
                panelBlockElement.querySelector('.button--moveOccupancyTypePrintUp').addEventListener('click', moveOccupancyTypePrint);
                panelBlockElement.querySelector('.button--moveOccupancyTypePrintDown').addEventListener('click', moveOccupancyTypePrint);
                panelBlockElement
                    .querySelector('.button--deleteOccupancyTypePrint')
                    ?.addEventListener('click', deleteOccupancyTypePrint);
                panelElement.append(panelBlockElement);
            }
        }
    }
    function renderOccupancyTypes() {
        // eslint-disable-next-line no-unsanitized/property
        occupancyTypesContainerElement.innerHTML = `<div class="panel container--occupancyType" id="container--allOccupancyTypeFields" data-occupancy-type-id="">
      <div class="panel-heading">
        <div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <h2 class="title is-4">(All ${los.escapedAliases.Occupancy} Types)</h2>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <button class="button is-success is-small button--addOccupancyTypeField" type="button">
                <span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>
                <span>Add Field</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>`;
        ContractTypePrintsContainerElement.innerHTML = '';
        renderOccupancyTypeFields(occupancyTypesContainerElement.querySelector('#container--allOccupancyTypeFields'), undefined, allOccupancyTypeFields);
        occupancyTypesContainerElement
            .querySelector('.button--addOccupancyTypeField')
            ?.addEventListener('click', openAddOccupancyTypeField);
        if (occupancyTypes.length === 0) {
            // eslint-disable-next-line no-unsanitized/method
            occupancyTypesContainerElement.insertAdjacentHTML('afterbegin', `<div class="message is-warning>
          <p class="message-body">There are no active ${los.escapedAliases.occupancy} types.</p>
          </div>`);
            // eslint-disable-next-line no-unsanitized/method
            ContractTypePrintsContainerElement.insertAdjacentHTML('afterbegin', `<div class="message is-warning>
          <p class="message-body">There are no active ${los.escapedAliases.occupancy} types.</p>
          </div>`);
            return;
        }
        for (const occupancyType of occupancyTypes) {
            /*
             * Types and Fields
             */
            const occupancyTypeContainer = document.createElement('div');
            occupancyTypeContainer.className = 'panel container--occupancyType';
            occupancyTypeContainer.dataset.occupancyTypeId =
                occupancyType.occupancyTypeId.toString();
            // eslint-disable-next-line no-unsanitized/property
            occupancyTypeContainer.innerHTML = `<div class="panel-heading">
        <div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <button class="button is-small button--toggleOccupancyTypeFields" data-tooltip="Toggle Fields" type="button" aria-label="Toggle Fields">
                ${expandedOccupancyTypes.has(occupancyType.occupancyTypeId)
                ? '<i class="fas fa-fw fa-minus" aria-hidden="true"></i>'
                : '<i class="fas fa-fw fa-plus" aria-hidden="true"></i>'}
              </button>
            </div>
            <div class="level-item">
              <h2 class="title is-4">${cityssm.escapeHTML(occupancyType.occupancyType)}</h2>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <button class="button is-danger is-small button--deleteOccupancyType" type="button">
                <span class="icon is-small"><i class="fas fa-trash" aria-hidden="true"></i></span>
                <span>Delete</span>
              </button>
            </div>
            <div class="level-item">
              <button class="button is-primary is-small button--editOccupancyType" type="button">
                <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
                <span>Edit ${los.escapedAliases.Occupancy} Type</span>
              </button>
            </div>
            <div class="level-item">
              <button class="button is-success is-small button--addOccupancyTypeField" type="button">
                <span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>
                <span>Add Field</span>
              </button>
            </div>
            <div class="level-item">
              ${los.getMoveUpDownButtonFieldHTML('button--moveOccupancyTypeUp', 'button--moveOccupancyTypeDown')}
            </div>
          </div>
        </div>
        </div>`;
            renderOccupancyTypeFields(occupancyTypeContainer, occupancyType.occupancyTypeId, occupancyType.occupancyTypeFields ?? []);
            occupancyTypeContainer
                .querySelector('.button--toggleOccupancyTypeFields')
                ?.addEventListener('click', toggleOccupancyTypeFields);
            occupancyTypeContainer
                .querySelector('.button--deleteOccupancyType')
                ?.addEventListener('click', deleteOccupancyType);
            occupancyTypeContainer
                .querySelector('.button--editOccupancyType')
                ?.addEventListener('click', openEditOccupancyType);
            occupancyTypeContainer
                .querySelector('.button--addOccupancyTypeField')
                ?.addEventListener('click', openAddOccupancyTypeField);
            occupancyTypeContainer.querySelector('.button--moveOccupancyTypeUp').addEventListener('click', moveOccupancyType);
            occupancyTypeContainer.querySelector('.button--moveOccupancyTypeDown').addEventListener('click', moveOccupancyType);
            occupancyTypesContainerElement.append(occupancyTypeContainer);
            /*
             * Prints
             */
            const occupancyTypePrintContainer = document.createElement('div');
            occupancyTypePrintContainer.className =
                'panel container--occupancyTypePrintList';
            occupancyTypePrintContainer.dataset.occupancyTypeId =
                occupancyType.occupancyTypeId.toString();
            occupancyTypePrintContainer.innerHTML = `<div class="panel-heading">
        <div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <h2 class="title is-4">${cityssm.escapeHTML(occupancyType.occupancyType)}</h2>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <button class="button is-success is-small button--addOccupancyTypePrint" type="button">
                <span class="icon is-small"><i class="fas fa-plus" aria-hidden="true"></i></span>
                <span>Add Print</span>
              </button>
            </div>
          </div>
        </div>
        </div>`;
            renderContractTypePrints(occupancyTypePrintContainer, occupancyType.occupancyTypeId, occupancyType.ContractTypePrints ?? []);
            occupancyTypePrintContainer
                .querySelector('.button--addOccupancyTypePrint')
                ?.addEventListener('click', openAddOccupancyTypePrint);
            ContractTypePrintsContainerElement.append(occupancyTypePrintContainer);
        }
    }
    document
        .querySelector('#button--addOccupancyType')
        ?.addEventListener('click', () => {
        let addCloseModalFunction;
        function doAdd(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${los.urlPrefix}/admin/doAddOccupancyType`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    addCloseModalFunction();
                    occupancyTypes = responseJSON.occupancyTypes;
                    renderOccupancyTypes();
                }
                else {
                    bulmaJS.alert({
                        title: `Error Adding ${los.escapedAliases.Occupancy} Type`,
                        message: responseJSON.errorMessage ?? '',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminOccupancyTypes-addOccupancyType', {
            onshow(modalElement) {
                los.populateAliases(modalElement);
            },
            onshown(modalElement, closeModalFunction) {
                addCloseModalFunction = closeModalFunction;
                modalElement.querySelector('#occupancyTypeAdd--occupancyType').focus();
                modalElement.querySelector('form')?.addEventListener('submit', doAdd);
                bulmaJS.toggleHtmlClipped();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    renderOccupancyTypes();
})();

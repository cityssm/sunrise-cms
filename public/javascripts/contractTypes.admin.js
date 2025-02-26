"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const los = exports.los;
    const occupancyTypesContainerElement = document.querySelector('#container--occupancyTypes');
    const ContractTypePrintsContainerElement = document.querySelector('#container--ContractTypePrints');
    let occupancyTypes = exports.occupancyTypes;
    delete exports.occupancyTypes;
    let allContractTypeFields = exports.allContractTypeFields;
    delete exports.allContractTypeFields;
    const expandedOccupancyTypes = new Set();
    function toggleContractTypeFields(clickEvent) {
        const toggleButtonElement = clickEvent.currentTarget;
        const occupancyTypeElement = toggleButtonElement.closest('.container--occupancyType');
        const contractTypeId = Number.parseInt(occupancyTypeElement.dataset.contractTypeId ?? '', 10);
        if (expandedOccupancyTypes.has(contractTypeId)) {
            expandedOccupancyTypes.delete(contractTypeId);
        }
        else {
            expandedOccupancyTypes.add(contractTypeId);
        }
        // eslint-disable-next-line no-unsanitized/property
        toggleButtonElement.innerHTML = expandedOccupancyTypes.has(contractTypeId)
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
            allContractTypeFields = responseJSON.allContractTypeFields;
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
        const contractTypeId = Number.parseInt(clickEvent.currentTarget.closest('.container--occupancyType').dataset.contractTypeId ?? '', 10);
        function doDelete() {
            cityssm.postJSON(`${los.urlPrefix}/admin/doDeleteContractType`, {
                contractTypeId
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
        const contractTypeId = Number.parseInt(clickEvent.currentTarget.closest('.container--occupancyType').dataset.contractTypeId ?? '', 10);
        const occupancyType = occupancyTypes.find((currentOccupancyType) => contractTypeId === currentOccupancyType.contractTypeId);
        let editCloseModalFunction;
        function doEdit(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${los.urlPrefix}/admin/doUpdateContractType`, submitEvent.currentTarget, (rawResponseJSON) => {
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
                modalElement.querySelector('#occupancyTypeEdit--contractTypeId').value = contractTypeId.toString();
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
        const contractTypeId = Number.parseInt(clickEvent.currentTarget.closest('.container--occupancyType').dataset.contractTypeId ?? '', 10);
        let addCloseModalFunction;
        function doAdd(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${los.urlPrefix}/admin/doAddContractTypeField`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                expandedOccupancyTypes.add(contractTypeId);
                occupancyTypeResponseHandler(responseJSON);
                if (responseJSON.success) {
                    addCloseModalFunction();
                    openEditOccupancyTypeField(contractTypeId, responseJSON.contractTypeFieldId ?? 0);
                }
            });
        }
        cityssm.openHtmlModal('adminOccupancyTypes-addOccupancyTypeField', {
            onshow(modalElement) {
                los.populateAliases(modalElement);
                if (contractTypeId) {
                    ;
                    modalElement.querySelector('#occupancyTypeFieldAdd--contractTypeId').value = contractTypeId.toString();
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
        const contractTypeId = clickEvent.currentTarget.closest('.container--occupancyType').dataset.contractTypeId;
        cityssm.postJSON(`${los.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveContractTypeUp'
            : 'doMoveContractTypeDown'}`, {
            contractTypeId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, occupancyTypeResponseHandler);
    }
    function openEditOccupancyTypeField(contractTypeId, contractTypeFieldId) {
        let occupancyType;
        if (contractTypeId) {
            occupancyType = occupancyTypes.find((currentOccupancyType) => currentOccupancyType.contractTypeId === contractTypeId);
        }
        const occupancyTypeField = (occupancyType
            ? occupancyType.ContractTypeFields ?? []
            : allContractTypeFields).find((currentOccupancyTypeField) => currentOccupancyTypeField.contractTypeFieldId === contractTypeFieldId);
        let fieldTypeElement;
        let minLengthInputElement;
        let maxLengthInputElement;
        let patternElement;
        let occupancyTypeFieldValuesElement;
        let editCloseModalFunction;
        function updateMaximumLengthMin() {
            maxLengthInputElement.min = minLengthInputElement.value;
        }
        function toggleInputFields() {
            switch (fieldTypeElement.value) {
                case 'date': {
                    minLengthInputElement.disabled = true;
                    maxLengthInputElement.disabled = true;
                    patternElement.disabled = true;
                    occupancyTypeFieldValuesElement.disabled = true;
                    break;
                }
                case 'select': {
                    minLengthInputElement.disabled = true;
                    maxLengthInputElement.disabled = true;
                    patternElement.disabled = true;
                    occupancyTypeFieldValuesElement.disabled = false;
                    break;
                }
                default: {
                    minLengthInputElement.disabled = false;
                    maxLengthInputElement.disabled = false;
                    patternElement.disabled = false;
                    occupancyTypeFieldValuesElement.disabled = true;
                    break;
                }
            }
        }
        function doUpdate(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${los.urlPrefix}/admin/doUpdateContractTypeField`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                occupancyTypeResponseHandler(responseJSON);
                if (responseJSON.success) {
                    editCloseModalFunction();
                }
            });
        }
        function doDelete() {
            cityssm.postJSON(`${los.urlPrefix}/admin/doDeleteContractTypeField`, {
                contractTypeFieldId
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
                modalElement.querySelector('#occupancyTypeFieldEdit--contractTypeFieldId').value = occupancyTypeField.contractTypeFieldId.toString();
                modalElement.querySelector('#occupancyTypeFieldEdit--occupancyTypeField').value = occupancyTypeField.occupancyTypeField ?? '';
                modalElement.querySelector('#occupancyTypeFieldEdit--isRequired').value = occupancyTypeField.isRequired ?? false ? '1' : '0';
                fieldTypeElement = modalElement.querySelector('#occupancyTypeFieldEdit--fieldType');
                fieldTypeElement.value = occupancyTypeField.fieldType;
                minLengthInputElement = modalElement.querySelector('#occupancyTypeFieldEdit--minLength');
                minLengthInputElement.value =
                    occupancyTypeField.minLength?.toString() ?? '';
                maxLengthInputElement = modalElement.querySelector('#occupancyTypeFieldEdit--maxLength');
                maxLengthInputElement.value =
                    occupancyTypeField.maxLength?.toString() ?? '';
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
                minLengthInputElement.addEventListener('keyup', updateMaximumLengthMin);
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
        const contractTypeFieldId = Number.parseInt(clickEvent.currentTarget.closest('.container--occupancyTypeField').dataset.contractTypeFieldId ?? '', 10);
        const contractTypeId = Number.parseInt(clickEvent.currentTarget.closest('.container--occupancyType').dataset.contractTypeId ?? '', 10);
        openEditOccupancyTypeField(contractTypeId, contractTypeFieldId);
    }
    function moveOccupancyTypeField(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const contractTypeFieldId = clickEvent.currentTarget.closest('.container--occupancyTypeField').dataset.contractTypeFieldId;
        cityssm.postJSON(`${los.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveContractTypeFieldUp'
            : // eslint-disable-next-line no-secrets/no-secrets
                'doMoveContractTypeFieldDown'}`, {
            contractTypeFieldId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, occupancyTypeResponseHandler);
    }
    function renderContractTypeFields(panelElement, contractTypeId, ContractTypeFields) {
        if (ContractTypeFields.length === 0) {
            // eslint-disable-next-line no-unsanitized/method
            panelElement.insertAdjacentHTML('beforeend', `<div class="panel-block is-block ${!contractTypeId || expandedOccupancyTypes.has(contractTypeId)
                ? ''
                : ' is-hidden'}">
        <div class="message is-info"><p class="message-body">There are no additional fields.</p></div>
        </div>`);
        }
        else {
            for (const occupancyTypeField of ContractTypeFields) {
                const panelBlockElement = document.createElement('div');
                panelBlockElement.className =
                    'panel-block is-block container--occupancyTypeField';
                if (contractTypeId && !expandedOccupancyTypes.has(contractTypeId)) {
                    panelBlockElement.classList.add('is-hidden');
                }
                panelBlockElement.dataset.contractTypeFieldId =
                    occupancyTypeField.contractTypeFieldId.toString();
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
        const contractTypeId = clickEvent.currentTarget.closest('.container--occupancyTypePrintList').dataset.contractTypeId ?? '';
        let closeAddModalFunction;
        function doAdd(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${los.urlPrefix}/admin/doAddContractTypePrint`, formEvent.currentTarget, (rawResponseJSON) => {
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
                modalElement.querySelector('#occupancyTypePrintAdd--contractTypeId').value = contractTypeId;
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
        const contractTypeId = buttonElement.closest('.container--occupancyTypePrintList').dataset.contractTypeId;
        cityssm.postJSON(`${los.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? // eslint-disable-next-line no-secrets/no-secrets
                'doMoveContractTypePrintUp'
            : // eslint-disable-next-line no-secrets/no-secrets
                'doMoveContractTypePrintDown'}`, {
            contractTypeId,
            printEJS,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, occupancyTypeResponseHandler);
    }
    function deleteOccupancyTypePrint(clickEvent) {
        clickEvent.preventDefault();
        const printEJS = clickEvent.currentTarget.closest('.container--occupancyTypePrint').dataset.printEJS;
        const contractTypeId = clickEvent.currentTarget.closest('.container--occupancyTypePrintList').dataset.contractTypeId;
        function doDelete() {
            cityssm.postJSON(`${los.urlPrefix}/admin/doDeleteContractTypePrint`, {
                contractTypeId,
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
    function renderContractTypePrints(panelElement, contractTypeId, ContractTypePrints) {
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
        occupancyTypesContainerElement.innerHTML = `<div class="panel container--occupancyType" id="container--allContractTypeFields" data-occupancy-type-id="">
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
        renderContractTypeFields(occupancyTypesContainerElement.querySelector('#container--allContractTypeFields'), undefined, allContractTypeFields);
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
            occupancyTypeContainer.dataset.contractTypeId =
                occupancyType.contractTypeId.toString();
            // eslint-disable-next-line no-unsanitized/property
            occupancyTypeContainer.innerHTML = `<div class="panel-heading">
        <div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <button class="button is-small button--toggleContractTypeFields" data-tooltip="Toggle Fields" type="button" aria-label="Toggle Fields">
                ${expandedOccupancyTypes.has(occupancyType.contractTypeId)
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
            renderContractTypeFields(occupancyTypeContainer, occupancyType.contractTypeId, occupancyType.ContractTypeFields ?? []);
            occupancyTypeContainer
                .querySelector('.button--toggleContractTypeFields')
                ?.addEventListener('click', toggleContractTypeFields);
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
            occupancyTypePrintContainer.dataset.contractTypeId =
                occupancyType.contractTypeId.toString();
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
            renderContractTypePrints(occupancyTypePrintContainer, occupancyType.contractTypeId, occupancyType.ContractTypePrints ?? []);
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
            cityssm.postJSON(`${los.urlPrefix}/admin/doAddContractType`, submitEvent.currentTarget, (rawResponseJSON) => {
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

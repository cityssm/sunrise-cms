"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const contractTypesContainerElement = document.querySelector('#container--contractTypes');
    const contractTypePrintsContainerElement = document.querySelector('#container--contractTypePrints');
    let contractTypes = exports.contractTypes;
    delete exports.contractTypes;
    let allContractTypeFields = exports.allContractTypeFields;
    delete exports.allContractTypeFields;
    const expandedContractTypes = new Set();
    function toggleContractTypeFields(clickEvent) {
        const toggleButtonElement = clickEvent.currentTarget;
        const contractTypeElement = toggleButtonElement.closest('.container--contractType');
        const contractTypeId = Number.parseInt(contractTypeElement.dataset.contractTypeId ?? '', 10);
        if (expandedContractTypes.has(contractTypeId)) {
            expandedContractTypes.delete(contractTypeId);
        }
        else {
            expandedContractTypes.add(contractTypeId);
        }
        // eslint-disable-next-line no-unsanitized/property
        toggleButtonElement.innerHTML = expandedContractTypes.has(contractTypeId)
            ? '<span class="icon"><i class="fa-solid fa-minus"></i></span>'
            : '<span class="icon"><i class="fa-solid fa-plus"></i></span>';
        const panelBlockElements = contractTypeElement.querySelectorAll('.panel-block');
        for (const panelBlockElement of panelBlockElements) {
            panelBlockElement.classList.toggle('is-hidden');
        }
    }
    function contractTypeResponseHandler(rawResponseJSON) {
        const responseJSON = rawResponseJSON;
        if (responseJSON.success) {
            contractTypes = responseJSON.contractTypes;
            allContractTypeFields = responseJSON.allContractTypeFields;
            renderContractTypes();
        }
        else {
            bulmaJS.alert({
                contextualColorName: 'danger',
                title: 'Error Updating Contract Type',
                message: responseJSON.errorMessage ?? ''
            });
        }
    }
    function deleteContractType(clickEvent) {
        const contractTypeId = Number.parseInt(clickEvent.currentTarget.closest('.container--contractType').dataset.contractTypeId ?? '', 10);
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doDeleteContractType`, {
                contractTypeId
            }, contractTypeResponseHandler);
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Contract Type',
            message: 'Are you sure you want to delete this contract type?',
            okButton: {
                callbackFunction: doDelete,
                text: 'Yes, Delete Contract Type'
            }
        });
    }
    function openEditContractType(clickEvent) {
        const contractTypeId = Number.parseInt(clickEvent.currentTarget.closest('.container--contractType').dataset.contractTypeId ?? '', 10);
        const contractType = contractTypes.find((currentContractType) => contractTypeId === currentContractType.contractTypeId);
        let editCloseModalFunction;
        function doEdit(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateContractType`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                contractTypeResponseHandler(responseJSON);
                if (responseJSON.success) {
                    editCloseModalFunction();
                }
            });
        }
        cityssm.openHtmlModal('adminContractTypes-edit', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                modalElement.querySelector('#contractTypeEdit--contractTypeId').value = contractTypeId.toString();
                modalElement.querySelector('#contractTypeEdit--contractType').value = contractType.contractType;
                if (contractType.isPreneed) {
                    ;
                    modalElement.querySelector('#contractTypeEdit--isPreneed').checked = true;
                }
            },
            onshown(modalElement, closeModalFunction) {
                editCloseModalFunction = closeModalFunction;
                modalElement.querySelector('#contractTypeEdit--contractType').focus();
                modalElement.querySelector('form')?.addEventListener('submit', doEdit);
                bulmaJS.toggleHtmlClipped();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function openAddContractTypeField(clickEvent) {
        const contractTypeId = Number.parseInt(clickEvent.currentTarget.closest('.container--contractType').dataset.contractTypeId ?? '', 10);
        let addCloseModalFunction;
        function doAdd(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doAddContractTypeField`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                expandedContractTypes.add(contractTypeId);
                contractTypeResponseHandler(responseJSON);
                if (responseJSON.success) {
                    addCloseModalFunction();
                    openEditContractTypeField(contractTypeId, responseJSON.contractTypeFieldId ?? 0);
                }
            });
        }
        cityssm.openHtmlModal('adminContractTypes-addField', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                if (contractTypeId) {
                    ;
                    modalElement.querySelector('#contractTypeFieldAdd--contractTypeId').value = contractTypeId.toString();
                }
            },
            onshown(modalElement, closeModalFunction) {
                addCloseModalFunction = closeModalFunction;
                modalElement.querySelector('#contractTypeFieldAdd--contractTypeField').focus();
                modalElement.querySelector('form')?.addEventListener('submit', doAdd);
                bulmaJS.toggleHtmlClipped();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function moveContractType(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const contractTypeId = clickEvent.currentTarget.closest('.container--contractType').dataset.contractTypeId;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveContractTypeUp'
            : 'doMoveContractTypeDown'}`, {
            contractTypeId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, contractTypeResponseHandler);
    }
    function openEditContractTypeField(contractTypeId, contractTypeFieldId) {
        let contractType;
        if (contractTypeId) {
            contractType = contractTypes.find((currentContractType) => currentContractType.contractTypeId === contractTypeId);
        }
        const contractTypeField = (contractType
            ? contractType.contractTypeFields ?? []
            : allContractTypeFields).find((currentContractTypeField) => currentContractTypeField.contractTypeFieldId === contractTypeFieldId);
        let fieldTypeElement;
        let minLengthInputElement;
        let maxLengthInputElement;
        let patternElement;
        let fieldValuesElement;
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
                    fieldValuesElement.disabled = true;
                    break;
                }
                case 'select': {
                    minLengthInputElement.disabled = true;
                    maxLengthInputElement.disabled = true;
                    patternElement.disabled = true;
                    fieldValuesElement.disabled = false;
                    break;
                }
                default: {
                    minLengthInputElement.disabled = false;
                    maxLengthInputElement.disabled = false;
                    patternElement.disabled = false;
                    fieldValuesElement.disabled = true;
                    break;
                }
            }
        }
        function doUpdate(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateContractTypeField`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                contractTypeResponseHandler(responseJSON);
                if (responseJSON.success) {
                    editCloseModalFunction();
                }
            });
        }
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doDeleteContractTypeField`, {
                contractTypeFieldId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                contractTypeResponseHandler(responseJSON);
                if (responseJSON.success) {
                    editCloseModalFunction();
                }
            });
        }
        function confirmDoDelete() {
            bulmaJS.confirm({
                contextualColorName: 'warning',
                title: 'Delete Field',
                message: `Are you sure you want to delete this field?
            Note that historical records that make use of this field will not be affected.`,
                okButton: {
                    callbackFunction: doDelete,
                    text: 'Yes, Delete Field'
                }
            });
        }
        cityssm.openHtmlModal('adminContractTypes-editField', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                modalElement.querySelector('#contractTypeFieldEdit--contractTypeFieldId').value = contractTypeField.contractTypeFieldId.toString();
                modalElement.querySelector('#contractTypeFieldEdit--contractTypeField').value = contractTypeField.contractTypeField ?? '';
                modalElement.querySelector('#contractTypeFieldEdit--isRequired').value = contractTypeField.isRequired ?? false ? '1' : '0';
                fieldTypeElement = modalElement.querySelector('#contractTypeFieldEdit--fieldType');
                fieldTypeElement.value = contractTypeField.fieldType;
                minLengthInputElement = modalElement.querySelector('#contractTypeFieldEdit--minLength');
                minLengthInputElement.value =
                    contractTypeField.minLength?.toString() ?? '';
                maxLengthInputElement = modalElement.querySelector('#contractTypeFieldEdit--maxLength');
                maxLengthInputElement.value =
                    contractTypeField.maxLength?.toString() ?? '';
                patternElement = modalElement.querySelector('#contractTypeFieldEdit--pattern');
                patternElement.value = contractTypeField.pattern ?? '';
                fieldValuesElement = modalElement.querySelector('#contractTypeFieldEdit--fieldValues');
                fieldValuesElement.value = contractTypeField.fieldValues ?? '';
                toggleInputFields();
            },
            onshown(modalElement, closeModalFunction) {
                editCloseModalFunction = closeModalFunction;
                bulmaJS.init(modalElement);
                bulmaJS.toggleHtmlClipped();
                cityssm.enableNavBlocker();
                modalElement.querySelector('form')?.addEventListener('submit', doUpdate);
                minLengthInputElement.addEventListener('keyup', updateMaximumLengthMin);
                updateMaximumLengthMin();
                fieldTypeElement.addEventListener('change', toggleInputFields);
                modalElement
                    .querySelector('#button--deleteContractTypeField')
                    ?.addEventListener('click', confirmDoDelete);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
                cityssm.disableNavBlocker();
            }
        });
    }
    function openEditContractTypeFieldByClick(clickEvent) {
        clickEvent.preventDefault();
        const contractTypeFieldId = Number.parseInt(clickEvent.currentTarget.closest('.container--contractTypeField').dataset.contractTypeFieldId ?? '', 10);
        const contractTypeId = Number.parseInt(clickEvent.currentTarget.closest('.container--contractType').dataset.contractTypeId ?? '', 10);
        openEditContractTypeField(contractTypeId, contractTypeFieldId);
    }
    function moveContractTypeField(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const contractTypeFieldId = clickEvent.currentTarget.closest('.container--contractTypeField').dataset.contractTypeFieldId;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? // eslint-disable-next-line no-secrets/no-secrets
                'doMoveContractTypeFieldUp'
            : // eslint-disable-next-line no-secrets/no-secrets
                'doMoveContractTypeFieldDown'}`, {
            contractTypeFieldId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, contractTypeResponseHandler);
    }
    function renderContractTypeFields(panelElement, contractTypeId, contractTypeFields) {
        if (contractTypeFields.length === 0) {
            // eslint-disable-next-line no-unsanitized/method
            panelElement.insertAdjacentHTML('beforeend', `<div class="panel-block is-block ${!contractTypeId || expandedContractTypes.has(contractTypeId)
                ? ''
                : ' is-hidden'}">
        <div class="message is-info"><p class="message-body">There are no additional fields.</p></div>
        </div>`);
        }
        else {
            for (const contractTypeField of contractTypeFields) {
                const panelBlockElement = document.createElement('div');
                panelBlockElement.className =
                    'panel-block is-block container--contractTypeField';
                if (contractTypeId && !expandedContractTypes.has(contractTypeId)) {
                    panelBlockElement.classList.add('is-hidden');
                }
                panelBlockElement.dataset.contractTypeFieldId =
                    contractTypeField.contractTypeFieldId.toString();
                // eslint-disable-next-line no-unsanitized/property
                panelBlockElement.innerHTML = `<div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <a class="has-text-weight-bold button--editContractTypeField" href="#">
                ${cityssm.escapeHTML(contractTypeField.contractTypeField ?? '')}
              </a>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              ${sunrise.getMoveUpDownButtonFieldHTML('button--moveContractTypeFieldUp', 'button--moveContractTypeFieldDown')}
            </div>
          </div>
          </div>`;
                panelBlockElement
                    .querySelector('.button--editContractTypeField')
                    ?.addEventListener('click', openEditContractTypeFieldByClick);
                panelBlockElement.querySelector('.button--moveContractTypeFieldUp').addEventListener('click', moveContractTypeField);
                panelBlockElement.querySelector('.button--moveContractTypeFieldDown').addEventListener('click', moveContractTypeField);
                panelElement.append(panelBlockElement);
            }
        }
    }
    /*
     * Prints
     */
    function openAddContractTypePrint(clickEvent) {
        const contractTypeId = clickEvent.currentTarget.closest('.container--contractTypePrintList').dataset.contractTypeId ?? '';
        let closeAddModalFunction;
        function doAdd(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doAddContractTypePrint`, formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    closeAddModalFunction();
                }
                contractTypeResponseHandler(responseJSON);
            });
        }
        cityssm.openHtmlModal('adminContractTypes-addPrint', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                modalElement.querySelector('#contractTypePrintAdd--contractTypeId').value = contractTypeId;
                const printSelectElement = modalElement.querySelector('#contractTypePrintAdd--printEJS');
                for (const [printEJS, printTitle] of Object.entries(exports.contractTypePrintTitles)) {
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
    function moveContractTypePrint(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const printEJS = buttonElement.closest('.container--contractTypePrint').dataset.printEJS;
        const contractTypeId = buttonElement.closest('.container--contractTypePrintList').dataset.contractTypeId;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveContractTypePrintUp'
            : 'doMoveContractTypePrintDown'}`, {
            contractTypeId,
            printEJS,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, contractTypeResponseHandler);
    }
    function deleteContractTypePrint(clickEvent) {
        clickEvent.preventDefault();
        const printEJS = clickEvent.currentTarget.closest('.container--contractTypePrint').dataset.printEJS;
        const contractTypeId = clickEvent.currentTarget.closest('.container--contractTypePrintList').dataset.contractTypeId;
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doDeleteContractTypePrint`, {
                contractTypeId,
                printEJS
            }, contractTypeResponseHandler);
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Print',
            message: 'Are you sure you want to remove this print option?',
            okButton: {
                callbackFunction: doDelete,
                text: 'Yes, Remove Print'
            }
        });
    }
    function renderContractTypePrints(panelElement, contractTypeId, contractTypePrints) {
        if (contractTypePrints.length === 0) {
            panelElement.insertAdjacentHTML('beforeend', `<div class="panel-block is-block">
          <div class="message is-info">
            <p class="message-body">There are no prints associated with this record.</p>
          </div>
          </div>`);
        }
        else {
            for (const printEJS of contractTypePrints) {
                const panelBlockElement = document.createElement('div');
                panelBlockElement.className =
                    'panel-block is-block container--contractTypePrint';
                panelBlockElement.dataset.printEJS = printEJS;
                const printTitle = printEJS === '*'
                    ? '(All Available Prints)'
                    : exports.contractTypePrintTitles[printEJS];
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
              <i class="fa-solid ${printIconClass}"></i>
            </div>
            <div class="level-item">
              ${cityssm.escapeHTML(printTitle || printEJS)}
            </div>
          </div>
          <div class="level-right is-hidden-print">
            <div class="level-item">
              ${sunrise.getMoveUpDownButtonFieldHTML('button--moveContractTypePrintUp', 'button--moveContractTypePrintDown')}
            </div>
            <div class="level-item">
              <button class="button is-small is-danger button--deleteContractTypePrint" title="Delete" type="button">
                <span class="icon is-small"><i class="fa-solid fa-trash"></i></span>
              </button>
            </div>
          </div>
          </div>`;
                panelBlockElement.querySelector('.button--moveContractTypePrintUp').addEventListener('click', moveContractTypePrint);
                panelBlockElement.querySelector('.button--moveContractTypePrintDown').addEventListener('click', moveContractTypePrint);
                panelBlockElement
                    .querySelector('.button--deleteContractTypePrint')
                    ?.addEventListener('click', deleteContractTypePrint);
                panelElement.append(panelBlockElement);
            }
        }
    }
    /*
     * Both
     */
    function renderContractTypes() {
        contractTypesContainerElement.innerHTML = `<div class="panel container--contractType" id="container--allContractTypeFields" data-contract-type-id="">
      <div class="panel-heading">
        <div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <h2 class="title is-5 has-text-white">(All Contract Types)</h2>
            </div>
          </div>
          <div class="level-right is-hidden-print">
            <div class="level-item">
              <button class="button is-success is-small button--addContractTypeField" type="button">
                <span class="icon is-small"><i class="fa-solid fa-plus"></i></span>
                <span>Add Field</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>`;
        contractTypePrintsContainerElement.innerHTML = '';
        renderContractTypeFields(contractTypesContainerElement.querySelector('#container--allContractTypeFields'), undefined, allContractTypeFields);
        contractTypesContainerElement
            .querySelector('.button--addContractTypeField')
            ?.addEventListener('click', openAddContractTypeField);
        if (contractTypes.length === 0) {
            contractTypesContainerElement.insertAdjacentHTML('afterbegin', `<div class="message is-warning>
          <p class="message-body">There are no active contract types.</p>
          </div>`);
            contractTypePrintsContainerElement.insertAdjacentHTML('afterbegin', `<div class="message is-warning>
          <p class="message-body">There are no active contract types.</p>
          </div>`);
            return;
        }
        for (const contractType of contractTypes) {
            /*
             * Types and Fields
             */
            const contractTypeContainer = document.createElement('div');
            contractTypeContainer.className = 'panel container--contractType';
            contractTypeContainer.dataset.contractTypeId =
                contractType.contractTypeId.toString();
            // eslint-disable-next-line no-unsanitized/property
            contractTypeContainer.innerHTML = `<div class="panel-heading">
        <div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <button class="button is-small button--toggleContractTypeFields" title="Toggle Fields" type="button">
                <span class="icon">
                  ${expandedContractTypes.has(contractType.contractTypeId)
                ? '<i class="fa-solid fa-minus"></i>'
                : '<i class="fa-solid fa-plus"></i>'}
                </span>
              </button>
            </div>
            <div class="level-item">
              <h2 class="title is-5 has-text-white">${cityssm.escapeHTML(contractType.contractType)}</h2>
            </div>
            ${contractType.isPreneed
                ? `<div class="level-item">
                    <span class="tag is-info">Preneed</span>
                    </div>`
                : ''}
          </div>
          <div class="level-right is-hidden-print">
            <div class="level-item">
              <button class="button is-danger is-small button--deleteContractType" type="button">
                <span class="icon is-small"><i class="fa-solid fa-trash"></i></span>
                <span>Delete</span>
              </button>
            </div>
            <div class="level-item">
              <button class="button is-primary is-small button--editContractType" type="button">
                <span class="icon is-small"><i class="fa-solid fa-pencil-alt"></i></span>
                <span>Edit Contract Type</span>
              </button>
            </div>
            <div class="level-item">
              <button class="button is-success is-small button--addContractTypeField" type="button">
                <span class="icon is-small"><i class="fa-solid fa-plus"></i></span>
                <span>Add Field</span>
              </button>
            </div>
            <div class="level-item">
              ${sunrise.getMoveUpDownButtonFieldHTML('button--moveContractTypeUp', 'button--moveContractTypeDown')}
            </div>
          </div>
        </div>
        </div>`;
            renderContractTypeFields(contractTypeContainer, contractType.contractTypeId, contractType.contractTypeFields ?? []);
            contractTypeContainer
                .querySelector('.button--toggleContractTypeFields')
                ?.addEventListener('click', toggleContractTypeFields);
            contractTypeContainer
                .querySelector('.button--deleteContractType')
                ?.addEventListener('click', deleteContractType);
            contractTypeContainer
                .querySelector('.button--editContractType')
                ?.addEventListener('click', openEditContractType);
            contractTypeContainer
                .querySelector('.button--addContractTypeField')
                ?.addEventListener('click', openAddContractTypeField);
            contractTypeContainer.querySelector('.button--moveContractTypeUp').addEventListener('click', moveContractType);
            contractTypeContainer.querySelector('.button--moveContractTypeDown').addEventListener('click', moveContractType);
            contractTypesContainerElement.append(contractTypeContainer);
            /*
             * Prints
             */
            const contractTypePrintContainer = document.createElement('div');
            contractTypePrintContainer.className =
                'panel container--contractTypePrintList';
            contractTypePrintContainer.dataset.contractTypeId =
                contractType.contractTypeId.toString();
            contractTypePrintContainer.innerHTML = `<div class="panel-heading">
        <div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <h2 class="title is-5 has-text-white">${cityssm.escapeHTML(contractType.contractType)}</h2>
            </div>
          </div>
          <div class="level-right is-hidden-print">
            <div class="level-item">
              <button class="button is-success is-small button--addContractTypePrint" type="button">
                <span class="icon is-small"><i class="fa-solid fa-plus"></i></span>
                <span>Add Print</span>
              </button>
            </div>
          </div>
        </div>
        </div>`;
            renderContractTypePrints(contractTypePrintContainer, contractType.contractTypeId, contractType.contractTypePrints ?? []);
            contractTypePrintContainer
                .querySelector('.button--addContractTypePrint')
                ?.addEventListener('click', openAddContractTypePrint);
            contractTypePrintsContainerElement.append(contractTypePrintContainer);
        }
    }
    document
        .querySelector('#button--addContractType')
        ?.addEventListener('click', () => {
        let addCloseModalFunction;
        function doAdd(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doAddContractType`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    addCloseModalFunction();
                    contractTypes = responseJSON.contractTypes;
                    renderContractTypes();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Contract Type',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminContractTypes-add', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
            },
            onshown(modalElement, closeModalFunction) {
                addCloseModalFunction = closeModalFunction;
                modalElement.querySelector('#contractTypeAdd--contractType').focus();
                modalElement.querySelector('form')?.addEventListener('submit', doAdd);
                bulmaJS.toggleHtmlClipped();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    renderContractTypes();
})();

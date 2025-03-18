"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const contractId = document.querySelector('#contract--contractId').value;
    let contractInterments = exports.contractInterments;
    delete exports.contractInterments;
    const deathAgePeriods = exports.deathAgePeriods;
    delete exports.deathAgePeriods;
    const intermentContainerTypes = exports.intermentContainerTypes;
    delete exports.intermentContainerTypes;
    function openEditContractInterment(clickEvent) {
        const intermentNumber = clickEvent.currentTarget.closest('tr')?.dataset.intermentNumber;
        if (intermentNumber === undefined) {
            return;
        }
        const contractInterment = contractInterments.find((interment) => interment.intermentNumber === Number(intermentNumber));
        if (contractInterment === undefined) {
            return;
        }
        let closeModalFunction;
        function submitForm(formEvent) {
            formEvent.preventDefault();
            const formElement = formEvent.currentTarget;
            cityssm.postJSON('/contracts/doUpdateContractInterment', formElement, (responseJSON) => {
                if (responseJSON.success) {
                    contractInterments = responseJSON.contractInterments;
                    renderContractInterments();
                    closeModalFunction();
                }
            });
        }
        cityssm.openHtmlModal('contract-editInterment', {
            // eslint-disable-next-line complexity
            onshow(modalElement) {
                modalElement
                    .querySelector('#contractIntermentEdit--contractId')
                    ?.setAttribute('value', contractId);
                modalElement
                    .querySelector('#contractIntermentEdit--intermentNumber')
                    ?.setAttribute('value', intermentNumber);
                modalElement
                    .querySelector('#contractIntermentEdit--deceasedName')
                    ?.setAttribute('value', contractInterment.deceasedName ?? '');
                modalElement
                    .querySelector('#contractIntermentEdit--deceasedAddress1')
                    ?.setAttribute('value', contractInterment.deceasedAddress1 ?? '');
                modalElement
                    .querySelector('#contractIntermentEdit--deceasedAddress2')
                    ?.setAttribute('value', contractInterment.deceasedAddress2 ?? '');
                modalElement
                    .querySelector('#contractIntermentEdit--deceasedCity')
                    ?.setAttribute('value', contractInterment.deceasedCity ?? '');
                modalElement
                    .querySelector('#contractIntermentEdit--deceasedProvince')
                    ?.setAttribute('value', contractInterment.deceasedProvince ?? '');
                modalElement
                    .querySelector('#contractIntermentEdit--deceasedPostalCode')
                    ?.setAttribute('value', contractInterment.deceasedPostalCode ?? '');
                modalElement
                    .querySelector('#contractIntermentEdit--birthDateString')
                    ?.setAttribute('value', contractInterment.birthDateString ?? '');
                modalElement
                    .querySelector('#contractIntermentEdit--birthPlace')
                    ?.setAttribute('value', contractInterment.birthPlace ?? '');
                modalElement
                    .querySelector('#contractIntermentEdit--deathDateString')
                    ?.setAttribute('value', contractInterment.deathDateString ?? '');
                modalElement
                    .querySelector('#contractIntermentEdit--deathPlace')
                    ?.setAttribute('value', contractInterment.deathPlace ?? '');
                modalElement
                    .querySelector('#contractIntermentEdit--deathAge')
                    ?.setAttribute('value', contractInterment.deathAge?.toString() ?? '');
                const deathAgePeriodElement = modalElement.querySelector('#contractIntermentEdit--deathAgePeriod');
                let deathAgePeriodIsFound = false;
                for (const deathAgePeriod of deathAgePeriods) {
                    const optionElement = document.createElement('option');
                    optionElement.value = deathAgePeriod;
                    optionElement.text = deathAgePeriod;
                    if (deathAgePeriod === contractInterment.deathAgePeriod) {
                        optionElement.selected = true;
                        deathAgePeriodIsFound = true;
                    }
                    deathAgePeriodElement.append(optionElement);
                }
                if (!deathAgePeriodIsFound) {
                    const optionElement = document.createElement('option');
                    optionElement.value = contractInterment.deathAgePeriod ?? '';
                    optionElement.text = contractInterment.deathAgePeriod ?? '(Not Set)';
                    optionElement.selected = true;
                    deathAgePeriodElement.append(optionElement);
                }
                const containerTypeElement = modalElement.querySelector('#contractIntermentEdit--intermentContainerTypeId');
                let containerTypeIsFound = false;
                for (const containerType of intermentContainerTypes) {
                    const optionElement = document.createElement('option');
                    optionElement.value =
                        containerType.intermentContainerTypeId.toString();
                    optionElement.text = containerType.intermentContainerType;
                    if (containerType.intermentContainerTypeId ===
                        contractInterment.intermentContainerTypeId) {
                        optionElement.selected = true;
                        containerTypeIsFound = true;
                    }
                    containerTypeElement
                        .querySelector(`optgroup[data-is-cremation-type="${containerType.isCremationType ? '1' : '0'}"]`)
                        ?.append(optionElement);
                }
                if ((contractInterment.intermentContainerTypeId ?? '') !== '' &&
                    !containerTypeIsFound) {
                    const optionElement = document.createElement('option');
                    optionElement.value =
                        contractInterment.intermentContainerTypeId?.toString() ?? '';
                    optionElement.text = contractInterment.intermentContainerType ?? '';
                    optionElement.selected = true;
                    containerTypeElement.append(optionElement);
                }
            },
            onshown(modalElement, closeModal) {
                closeModalFunction = closeModal;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#contractIntermentEdit--deceasedName').focus();
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', submitForm);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteContractInterment(clickEvent) {
        const intermentNumber = clickEvent.currentTarget.closest('tr')?.dataset.intermentNumber;
        if (intermentNumber === undefined) {
            return;
        }
        function doDelete() {
            cityssm.postJSON('/contracts/doDeleteContractInterment', {
                contractId,
                intermentNumber
            }, (responseJSON) => {
                if (responseJSON.success) {
                    contractInterments = responseJSON.contractInterments;
                    renderContractInterments();
                }
            });
        }
        bulmaJS.confirm({
            title: 'Delete Interment?',
            message: 'Are you sure you want to remove this interment from the contract?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Remove Interment',
                callbackFunction: doDelete
            }
        });
    }
    // eslint-disable-next-line complexity
    function renderContractInterments() {
        const containerElement = document.querySelector('#container--contractInterments');
        if (contractInterments.length === 0) {
            containerElement.innerHTML = `<div class="message is-info">
          <p class="message-body">There are no interments associated with this record.</p>
          </div>`;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        tableElement.innerHTML = `<thead><tr>
        <th>Name</th>
        <th>Details</th>
        <th class="is-hidden-print"><span class="is-sr-only">Options</span></th>
        </tr></thead>
        <tbody></tbody>`;
        for (const interment of contractInterments) {
            const tableRowElement = document.createElement('tr');
            tableRowElement.dataset.intermentNumber =
                interment.intermentNumber?.toString();
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = `<td>
            ${cityssm.escapeHTML(interment.deceasedName ?? '')}<br />
            <span class="is-size-7">
            ${cityssm.escapeHTML(interment.deceasedAddress1 ?? '')}<br />
            ${interment.deceasedAddress2 === '' ? '' : `${cityssm.escapeHTML(interment.deceasedAddress2 ?? '')}<br />`}
            ${cityssm.escapeHTML(interment.deceasedCity ?? '')}, ${cityssm.escapeHTML(interment.deceasedProvince ?? '')}<br />
            ${cityssm.escapeHTML(interment.deceasedPostalCode ?? '')}
            </span>
          </td>
          <td>
            <div class="columns mb-0">
              <div class="column">
                <strong>Birth:</strong>
              </div>
              <div class="column">
                ${cityssm.escapeHTML(interment.birthDateString ?? '(No Birth Date)')}<br />
                ${cityssm.escapeHTML(interment.birthPlace ?? '(No Birth Place)')}
              </div>
            </div>
            <div class="columns">
              <div class="column">
                <strong>Death:</strong>
              </div>
              <div class="column">
                ${cityssm.escapeHTML(interment.deathDateString ?? '(No Death Date)')}<br />
                ${cityssm.escapeHTML(interment.deathPlace ?? '(No Death Place)')}
              </div>
            </div>
            <div class="columns">
              <div class="column">
                <strong>Age:</strong>
              </div>
              <div class="column">
                ${cityssm.escapeHTML(interment.deathAge === undefined ? '(No Age)' : interment.deathAge.toString())}
                ${cityssm.escapeHTML(interment.deathAgePeriod ?? '')}
              </div>
            </div>
            <div class="columns">
              <div class="column">
                <strong>Container:</strong>
              </div>
              <div class="column">
                ${cityssm.escapeHTML(interment.intermentContainerType ?? '(No Container Type)')}
              </div>
            </div>
          </td>
          <td class="is-hidden-print has-text-right">
            <button class="button is-small is-info button--edit mb-1" type="button" data-tooltip="Edit Interment">
              <span class="icon"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
              <span>Edit</span>
            </button><br />
            <button class="button is-small is-danger button--delete" type="button" data-tooltip="Remove Interment">
              <span class="icon"><i class="fas fa-trash" aria-hidden="true"></i></span>
            </button>
          </td>`;
            tableRowElement
                .querySelector('.button--edit')
                ?.addEventListener('click', openEditContractInterment);
            tableRowElement
                .querySelector('.button--delete')
                ?.addEventListener('click', deleteContractInterment);
            tableElement.querySelector('tbody')?.append(tableRowElement);
        }
        containerElement.innerHTML = '';
        containerElement.append(tableElement);
    }
    document
        .querySelector('#button--addInterment')
        ?.addEventListener('click', () => {
        let closeModalFunction;
        function submitForm(formEvent) {
            formEvent.preventDefault();
            const formElement = formEvent.currentTarget;
            cityssm.postJSON('/contracts/doAddContractInterment', formElement, (responseJSON) => {
                if (responseJSON.success) {
                    contractInterments = responseJSON.contractInterments;
                    renderContractInterments();
                    closeModalFunction();
                }
            });
        }
        cityssm.openHtmlModal('contract-addInterment', {
            onshow(modalElement) {
                modalElement
                    .querySelector('#contractIntermentAdd--contractId')
                    ?.setAttribute('value', contractId);
                const deathAgePeriodElement = modalElement.querySelector('#contractIntermentAdd--deathAgePeriod');
                for (const deathAgePeriod of deathAgePeriods) {
                    const optionElement = document.createElement('option');
                    optionElement.value = deathAgePeriod;
                    optionElement.text = deathAgePeriod;
                    deathAgePeriodElement.append(optionElement);
                }
                const containerTypeElement = modalElement.querySelector('#contractIntermentAdd--intermentContainerTypeId');
                for (const containerType of intermentContainerTypes) {
                    const optionElement = document.createElement('option');
                    optionElement.value =
                        containerType.intermentContainerTypeId.toString();
                    optionElement.text = containerType.intermentContainerType;
                    containerTypeElement
                        .querySelector(`optgroup[data-is-cremation-type="${containerType.isCremationType ? '1' : '0'}"]`)
                        ?.append(optionElement);
                }
            },
            onshown(modalElement, closeModal) {
                closeModalFunction = closeModal;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#contractIntermentAdd--deceasedName').focus();
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', submitForm);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    renderContractInterments();
})();

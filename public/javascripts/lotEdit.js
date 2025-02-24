"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const los = exports.los;
    const lotId = document.querySelector('#lot--lotId')
        .value;
    const isCreate = lotId === '';
    // Main form
    let refreshAfterSave = isCreate;
    function setUnsavedChanges() {
        los.setUnsavedChanges();
        document
            .querySelector("button[type='submit'][form='form--lot']")
            ?.classList.remove('is-light');
    }
    function clearUnsavedChanges() {
        los.clearUnsavedChanges();
        document
            .querySelector("button[type='submit'][form='form--lot']")
            ?.classList.add('is-light');
    }
    const formElement = document.querySelector('#form--lot');
    function updateLot(formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON(`${los.urlPrefix}/lots/${isCreate ? 'doCreateLot' : 'doUpdateLot'}`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                clearUnsavedChanges();
                if (isCreate || refreshAfterSave) {
                    window.location.href = los.getLotURL(responseJSON.lotId, true, true);
                }
                else {
                    bulmaJS.alert({
                        message: `${los.escapedAliases.Lot} Updated Successfully`,
                        contextualColorName: 'success'
                    });
                }
            }
            else {
                bulmaJS.alert({
                    title: `Error Updating ${los.escapedAliases.Lot}`,
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    formElement.addEventListener('submit', updateLot);
    const formInputElements = formElement.querySelectorAll('input, select');
    for (const formInputElement of formInputElements) {
        formInputElement.addEventListener('change', setUnsavedChanges);
    }
    los.initializeUnlockFieldButtons(formElement);
    document
        .querySelector('#button--deleteLot')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        function doDelete() {
            cityssm.postJSON(`${los.urlPrefix}/lots/doDeleteLot`, {
                lotId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    clearUnsavedChanges();
                    window.location.href = los.getLotURL();
                }
                else {
                    bulmaJS.alert({
                        title: `Error Deleting ${los.escapedAliases.Lot}`,
                        message: responseJSON.errorMessage ?? '',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: `Delete ${los.escapedAliases.Lot}`,
            message: `Are you sure you want to delete this ${los.escapedAliases.lot}?`,
            contextualColorName: 'warning',
            okButton: {
                text: `Yes, Delete ${los.escapedAliases.Lot}`,
                callbackFunction: doDelete
            }
        });
    });
    // Lot Type
    const burialSiteTypeIdElement = document.querySelector('#lot--burialSiteTypeId');
    if (isCreate) {
        const lotFieldsContainerElement = document.querySelector('#container--lotFields');
        burialSiteTypeIdElement.addEventListener('change', () => {
            if (burialSiteTypeIdElement.value === '') {
                // eslint-disable-next-line no-unsanitized/property
                lotFieldsContainerElement.innerHTML = `<div class="message is-info">
          <p class="message-body">Select the ${los.escapedAliases.lot} type to load the available fields.</p>
          </div>`;
                return;
            }
            cityssm.postJSON(`${los.urlPrefix}/lots/doGetLotTypeFields`, {
                burialSiteTypeId: burialSiteTypeIdElement.value
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.lotTypeFields.length === 0) {
                    // eslint-disable-next-line no-unsanitized/property
                    lotFieldsContainerElement.innerHTML = `<div class="message is-info">
              <p class="message-body">
                There are no additional fields for this ${los.escapedAliases.lot} type.
              </p>
              </div>`;
                    return;
                }
                lotFieldsContainerElement.innerHTML = '';
                let lotTypeFieldIds = '';
                for (const lotTypeField of responseJSON.lotTypeFields) {
                    lotTypeFieldIds += `,${lotTypeField.lotTypeFieldId.toString()}`;
                    const fieldName = `lotFieldValue_${lotTypeField.lotTypeFieldId.toString()}`;
                    const fieldId = `lot--${fieldName}`;
                    const fieldElement = document.createElement('div');
                    fieldElement.className = 'field';
                    // eslint-disable-next-line no-unsanitized/property
                    fieldElement.innerHTML = `<label class="label" for="${fieldId}"></label>
              <div class="control"></div>`;
                    fieldElement.querySelector('label').textContent = lotTypeField.lotTypeField;
                    if (lotTypeField.lotTypeFieldValues === '') {
                        const inputElement = document.createElement('input');
                        inputElement.className = 'input';
                        inputElement.id = fieldId;
                        inputElement.name = fieldName;
                        inputElement.type = 'text';
                        inputElement.required = lotTypeField.isRequired;
                        inputElement.minLength = lotTypeField.minimumLength;
                        inputElement.maxLength = lotTypeField.maximumLength;
                        if ((lotTypeField.pattern ?? '') !== '') {
                            inputElement.pattern = lotTypeField.pattern ?? '';
                        }
                        fieldElement.querySelector('.control')?.append(inputElement);
                    }
                    else {
                        // eslint-disable-next-line no-unsanitized/property
                        ;
                        fieldElement.querySelector('.control').innerHTML = `<div class="select is-fullwidth">
                  <select id="${fieldId}" name="${fieldName}"><option value="">(Not Set)</option></select>
                  </div>`;
                        const selectElement = fieldElement.querySelector('select');
                        selectElement.required = lotTypeField.isRequired;
                        const optionValues = lotTypeField.lotTypeFieldValues.split('\n');
                        for (const optionValue of optionValues) {
                            const optionElement = document.createElement('option');
                            optionElement.value = optionValue;
                            optionElement.textContent = optionValue;
                            selectElement.append(optionElement);
                        }
                    }
                    lotFieldsContainerElement.append(fieldElement);
                }
                lotFieldsContainerElement.insertAdjacentHTML('beforeend', `<input name="lotTypeFieldIds" type="hidden"
              value="${cityssm.escapeHTML(lotTypeFieldIds.slice(1))}" />`);
            });
        });
    }
    else {
        const originalburialSiteTypeId = burialSiteTypeIdElement.value;
        burialSiteTypeIdElement.addEventListener('change', () => {
            if (burialSiteTypeIdElement.value !== originalburialSiteTypeId) {
                bulmaJS.confirm({
                    title: 'Confirm Change',
                    message: `Are you sure you want to change the ${los.escapedAliases.lot} type?\n
            This change affects the additional fields associated with this record.`,
                    contextualColorName: 'warning',
                    okButton: {
                        text: 'Yes, Keep the Change',
                        callbackFunction() {
                            refreshAfterSave = true;
                        }
                    },
                    cancelButton: {
                        text: 'Revert the Change',
                        callbackFunction() {
                            burialSiteTypeIdElement.value = originalburialSiteTypeId;
                        }
                    }
                });
            }
        });
    }
    // Comments
    let lotComments = exports.lotComments;
    delete exports.lotComments;
    function openEditLotComment(clickEvent) {
        const lotCommentId = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
            .lotCommentId ?? '', 10);
        const lotComment = lotComments.find((currentLotComment) => {
            return currentLotComment.lotCommentId === lotCommentId;
        });
        let editFormElement;
        let editCloseModalFunction;
        function editComment(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${los.urlPrefix}/lots/doUpdateLotComment`, editFormElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    lotComments = responseJSON.lotComments;
                    editCloseModalFunction();
                    renderLotComments();
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
        cityssm.openHtmlModal('lot-editComment', {
            onshow(modalElement) {
                los.populateAliases(modalElement);
                modalElement.querySelector('#lotCommentEdit--lotId').value = lotId;
                modalElement.querySelector('#lotCommentEdit--lotCommentId').value = lotCommentId.toString();
                modalElement.querySelector('#lotCommentEdit--lotComment').value = lotComment.lotComment ?? '';
                const lotCommentDateStringElement = modalElement.querySelector('#lotCommentEdit--lotCommentDateString');
                lotCommentDateStringElement.value =
                    lotComment.lotCommentDateString ?? '';
                const currentDateString = cityssm.dateToString(new Date());
                lotCommentDateStringElement.max =
                    lotComment.lotCommentDateString <= currentDateString
                        ? currentDateString
                        : lotComment.lotCommentDateString ?? '';
                modalElement.querySelector('#lotCommentEdit--lotCommentTimeString').value = lotComment.lotCommentTimeString ?? '';
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                los.initializeDatePickers(modalElement);
                modalElement.querySelector('#lotCommentEdit--lotComment').focus();
                editFormElement = modalElement.querySelector('form');
                editFormElement.addEventListener('submit', editComment);
                editCloseModalFunction = closeModalFunction;
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteLotComment(clickEvent) {
        const lotCommentId = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
            .lotCommentId ?? '', 10);
        function doDelete() {
            cityssm.postJSON(`${los.urlPrefix}/lots/doDeleteLotComment`, {
                lotId,
                lotCommentId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    lotComments = responseJSON.lotComments;
                    renderLotComments();
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
    function renderLotComments() {
        const containerElement = document.querySelector('#container--lotComments');
        if (lotComments.length === 0) {
            containerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no comments to display.</p>
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
        for (const lotComment of lotComments) {
            const tableRowElement = document.createElement('tr');
            tableRowElement.dataset.lotCommentId = lotComment.lotCommentId?.toString();
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = `<td>
          ${cityssm.escapeHTML(lotComment.recordCreate_userName ?? '')}
        </td><td>
          ${lotComment.lotCommentDateString}
          ${lotComment.lotCommentTime === 0
                ? ''
                : ` ${lotComment.lotCommentTimePeriodString}`}
        </td><td>
          ${cityssm.escapeHTML(lotComment.lotComment ?? '')}
        </td><td class="is-hidden-print">
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
                ?.addEventListener('click', openEditLotComment);
            tableRowElement
                .querySelector('.button--delete')
                ?.addEventListener('click', deleteLotComment);
            tableElement.querySelector('tbody')?.append(tableRowElement);
        }
        containerElement.innerHTML = '';
        containerElement.append(tableElement);
    }
    function openAddCommentModal() {
        let addCommentCloseModalFunction;
        function doAddComment(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${los.urlPrefix}/lots/doAddLotComment`, formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    lotComments = responseJSON.lotComments;
                    renderLotComments();
                    addCommentCloseModalFunction();
                }
            });
        }
        cityssm.openHtmlModal('lot-addComment', {
            onshow(modalElement) {
                los.populateAliases(modalElement);
                modalElement.querySelector('#lotCommentAdd--lotId').value = lotId;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddComment);
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                addCommentCloseModalFunction = closeModalFunction;
                modalElement.querySelector('#lotCommentAdd--lotComment').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
                document.querySelector('#lotComments--add').focus();
            }
        });
    }
    if (!isCreate) {
        document
            .querySelector('#lotComments--add')
            ?.addEventListener('click', openAddCommentModal);
        renderLotComments();
    }
})();

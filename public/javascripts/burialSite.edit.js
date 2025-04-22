"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const burialSiteId = document.querySelector('#burialSite--burialSiteId').value;
    const isCreate = burialSiteId === '';
    // Main form
    let refreshAfterSave = isCreate;
    function setUnsavedChanges() {
        sunrise.setUnsavedChanges();
        document
            .querySelector("button[type='submit'][form='form--burialSite']")
            ?.classList.remove('is-light');
    }
    function clearUnsavedChanges() {
        sunrise.clearUnsavedChanges();
        document
            .querySelector("button[type='submit'][form='form--burialSite']")
            ?.classList.add('is-light');
    }
    const formElement = document.querySelector('#form--burialSite');
    function updateBurialSite(formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/${isCreate ? 'doCreateBurialSite' : 'doUpdateBurialSite'}`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                clearUnsavedChanges();
                if (isCreate || refreshAfterSave) {
                    globalThis.location.href = sunrise.getBurialSiteURL(responseJSON.burialSiteId, true, true);
                }
                else {
                    bulmaJS.alert({
                        message: 'Burial Site Updated Successfully',
                        contextualColorName: 'success'
                    });
                }
            }
            else {
                bulmaJS.alert({
                    title: 'Error Updating Burial Site',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    formElement.addEventListener('submit', updateBurialSite);
    const formInputElements = formElement.querySelectorAll('input, select');
    for (const formInputElement of formInputElements) {
        formInputElement.addEventListener('change', setUnsavedChanges);
    }
    sunrise.initializeUnlockFieldButtons(formElement);
    document
        .querySelector('#button--deleteBurialSite')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doDeleteBurialSite`, {
                burialSiteId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    clearUnsavedChanges();
                    globalThis.location.href = sunrise.getBurialSiteURL();
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Deleting Burial Site',
                        message: responseJSON.errorMessage ?? '',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Delete Burial Site',
            message: 'Are you sure you want to delete this burial site?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete Burial Site',
                callbackFunction: doDelete
            }
        });
    });
    // Burial Site Type
    const burialSiteTypeIdElement = document.querySelector('#burialSite--burialSiteTypeId');
    if (isCreate) {
        const burialSiteFieldsContainerElement = document.querySelector('#container--burialSiteFields');
        burialSiteTypeIdElement.addEventListener('change', () => {
            if (burialSiteTypeIdElement.value === '') {
                burialSiteFieldsContainerElement.innerHTML = `<div class="message is-info">
          <p class="message-body">Select the burial site type to load the available fields.</p>
          </div>`;
                return;
            }
            cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doGetBurialSiteTypeFields`, {
                burialSiteTypeId: burialSiteTypeIdElement.value
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.burialSiteTypeFields.length === 0) {
                    burialSiteFieldsContainerElement.innerHTML = `<div class="message is-info">
              <p class="message-body">
                There are no additional fields for this burial site type.
              </p>
              </div>`;
                    return;
                }
                burialSiteFieldsContainerElement.innerHTML = '';
                let burialSiteTypeFieldIds = '';
                for (const burialSiteTypeField of responseJSON.burialSiteTypeFields) {
                    burialSiteTypeFieldIds += `,${burialSiteTypeField.burialSiteTypeFieldId.toString()}`;
                    const fieldName = `fieldValue_${burialSiteTypeField.burialSiteTypeFieldId.toString()}`;
                    const fieldId = `burialSite--${fieldName}`;
                    const fieldElement = document.createElement('div');
                    fieldElement.className = 'field';
                    // eslint-disable-next-line no-unsanitized/property
                    fieldElement.innerHTML = `<label class="label" for="${fieldId}"></label>
              <div class="control"></div>`;
                    fieldElement.querySelector('label').textContent = burialSiteTypeField.burialSiteTypeField;
                    if (burialSiteTypeField.fieldValues === '') {
                        const inputElement = document.createElement('input');
                        inputElement.className = 'input';
                        inputElement.id = fieldId;
                        inputElement.name = fieldName;
                        inputElement.type = 'text';
                        inputElement.required = burialSiteTypeField.isRequired;
                        inputElement.minLength = burialSiteTypeField.minLength;
                        inputElement.maxLength = burialSiteTypeField.maxLength;
                        if ((burialSiteTypeField.pattern ?? '') !== '') {
                            inputElement.pattern = burialSiteTypeField.pattern ?? '';
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
                        selectElement.required = burialSiteTypeField.isRequired;
                        const optionValues = burialSiteTypeField.fieldValues.split('\n');
                        for (const optionValue of optionValues) {
                            const optionElement = document.createElement('option');
                            optionElement.value = optionValue;
                            optionElement.textContent = optionValue;
                            selectElement.append(optionElement);
                        }
                    }
                    burialSiteFieldsContainerElement.append(fieldElement);
                }
                burialSiteFieldsContainerElement.insertAdjacentHTML('beforeend', 
                // eslint-disable-next-line no-secrets/no-secrets
                `<input name="burialSiteTypeFieldIds" type="hidden"
              value="${cityssm.escapeHTML(burialSiteTypeFieldIds.slice(1))}" />`);
            });
        });
    }
    else {
        const originalBurialSiteTypeId = burialSiteTypeIdElement.value;
        burialSiteTypeIdElement.addEventListener('change', () => {
            if (burialSiteTypeIdElement.value !== originalBurialSiteTypeId) {
                bulmaJS.confirm({
                    title: 'Confirm Change',
                    message: `Are you sure you want to change the burial site type?\n
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
                            burialSiteTypeIdElement.value = originalBurialSiteTypeId;
                        }
                    }
                });
            }
        });
    }
    // Leaflet Map
    document
        .querySelector('#button--selectCoordinate')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        sunrise.openLeafletCoordinateSelectorModal({
            latitudeElement: document.querySelector('#burialSite--burialSiteLatitude'),
            longitudeElement: document.querySelector('#burialSite--burialSiteLongitude'),
            callbackFunction: () => {
                setUnsavedChanges();
            }
        });
    });
    // Comments
    let burialSiteComments = exports.burialSiteComments;
    delete exports.burialSiteComments;
    function openEditBurialSiteComment(clickEvent) {
        const burialSiteCommentId = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
            .burialSiteCommentId ?? '', 10);
        const burialSiteComment = burialSiteComments.find((currentComment) => currentComment.burialSiteCommentId === burialSiteCommentId);
        let editFormElement;
        let editCloseModalFunction;
        function editComment(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doUpdateBurialSiteComment`, editFormElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    burialSiteComments = responseJSON.burialSiteComments;
                    editCloseModalFunction();
                    renderBurialSiteComments();
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
        cityssm.openHtmlModal('burialSite-editComment', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                modalElement
                    .querySelector('#burialSiteCommentEdit--burialSiteId')
                    ?.setAttribute('value', burialSiteId);
                modalElement
                    .querySelector('#burialSiteCommentEdit--burialSiteCommentId')
                    ?.setAttribute('value', burialSiteCommentId.toString());
                modalElement.querySelector('#burialSiteCommentEdit--comment').value = burialSiteComment.comment ?? '';
                const commentDateStringElement = modalElement.querySelector('#burialSiteCommentEdit--commentDateString');
                commentDateStringElement.value =
                    burialSiteComment.commentDateString ?? '';
                const currentDateString = cityssm.dateToString(new Date());
                commentDateStringElement.max =
                    burialSiteComment.commentDateString <= currentDateString
                        ? currentDateString
                        : burialSiteComment.commentDateString ?? '';
                modalElement.querySelector('#burialSiteCommentEdit--commentTimeString').value = burialSiteComment.commentTimeString ?? '';
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#burialSiteCommentEdit--comment').focus();
                editFormElement = modalElement.querySelector('form');
                editFormElement.addEventListener('submit', editComment);
                editCloseModalFunction = closeModalFunction;
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteBurialSiteComment(clickEvent) {
        const burialSiteCommentId = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
            .burialSiteCommentId ?? '', 10);
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doDeleteBurialSiteComment`, {
                burialSiteId,
                burialSiteCommentId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    burialSiteComments = responseJSON.burialSiteComments;
                    renderBurialSiteComments();
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
    function renderBurialSiteComments() {
        const containerElement = document.querySelector('#container--burialSiteComments');
        if (burialSiteComments.length === 0) {
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
        for (const burialSiteComment of burialSiteComments) {
            const tableRowElement = document.createElement('tr');
            tableRowElement.dataset.burialSiteCommentId =
                burialSiteComment.burialSiteCommentId?.toString();
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = `<td>
          ${cityssm.escapeHTML(burialSiteComment.recordCreate_userName ?? '')}
        </td><td>
          ${burialSiteComment.commentDateString}
          ${burialSiteComment.commentTime === 0
                ? ''
                : ` ${burialSiteComment.commentTimePeriodString}`}
        </td><td>
          ${cityssm.escapeHTML(burialSiteComment.comment ?? '')}
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
                ?.addEventListener('click', openEditBurialSiteComment);
            tableRowElement
                .querySelector('.button--delete')
                ?.addEventListener('click', deleteBurialSiteComment);
            tableElement.querySelector('tbody')?.append(tableRowElement);
        }
        containerElement.innerHTML = '';
        containerElement.append(tableElement);
    }
    function openAddCommentModal() {
        let addCommentCloseModalFunction;
        function doAddComment(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doAddBurialSiteComment`, formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    burialSiteComments = responseJSON.burialSiteComments;
                    renderBurialSiteComments();
                    addCommentCloseModalFunction();
                }
            });
        }
        cityssm.openHtmlModal('burialSite-addComment', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                modalElement
                    .querySelector('#burialSiteCommentAdd--burialSiteId')
                    ?.setAttribute('value', burialSiteId);
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddComment);
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                addCommentCloseModalFunction = closeModalFunction;
                modalElement.querySelector('#burialSiteCommentAdd--comment').focus();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
                document.querySelector('#burialSiteComments--add').focus();
            }
        });
    }
    if (!isCreate) {
        document
            .querySelector('#burialSiteComments--add')
            ?.addEventListener('click', openAddCommentModal);
        renderBurialSiteComments();
    }
    /*
     * Contracts
     */
    document
        .querySelector('#burialSite--contractsToggle')
        ?.addEventListener('click', () => {
        const tableRowElements = document.querySelectorAll('#burialSite--contractsTbody tr[data-is-active="false"]');
        for (const tableRowElement of tableRowElements) {
            tableRowElement.classList.toggle('is-hidden');
        }
    });
})();

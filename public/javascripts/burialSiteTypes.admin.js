// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
(() => {
    const sunrise = exports.sunrise;
    const containerElement = document.querySelector('#container--burialSiteTypes');
    let burialSiteTypes = exports.burialSiteTypes;
    delete exports.burialSiteTypes;
    const expandedBurialSiteTypes = new Set();
    function toggleBurialSiteTypeFields(clickEvent) {
        const toggleButtonElement = clickEvent.currentTarget;
        const burialSiteTypeElement = toggleButtonElement.closest('.container--burialSiteType');
        const burialSiteTypeId = Number.parseInt(burialSiteTypeElement.dataset.burialSiteTypeId ?? '', 10);
        if (expandedBurialSiteTypes.has(burialSiteTypeId)) {
            expandedBurialSiteTypes.delete(burialSiteTypeId);
        }
        else {
            expandedBurialSiteTypes.add(burialSiteTypeId);
        }
        // eslint-disable-next-line no-unsanitized/property
        toggleButtonElement.innerHTML = expandedBurialSiteTypes.has(burialSiteTypeId)
            ? '<span class="icon"><i class="fa-solid fa-minus"></i></span>'
            : '<span class="icon"><i class="fa-solid fa-plus"></i></span>';
        const panelBlockElements = burialSiteTypeElement.querySelectorAll('.panel-block');
        for (const panelBlockElement of panelBlockElements) {
            panelBlockElement.classList.toggle('is-hidden');
        }
    }
    function burialSiteTypeResponseHandler(rawResponseJSON) {
        const responseJSON = rawResponseJSON;
        if (responseJSON.success) {
            burialSiteTypes = responseJSON.burialSiteTypes;
            renderBurialSiteTypes();
        }
        else {
            bulmaJS.alert({
                contextualColorName: 'danger',
                title: 'Error Updating Burial Site Type',
                message: responseJSON.errorMessage ?? ''
            });
        }
    }
    function deleteBurialSiteType(clickEvent) {
        const burialSiteTypeId = Number.parseInt(clickEvent.currentTarget.closest('.container--burialSiteType').dataset.burialSiteTypeId ?? '', 10);
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doDeleteBurialSiteType`, {
                burialSiteTypeId
            }, burialSiteTypeResponseHandler);
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Burial Site Type',
            message: 'Are you sure you want to delete this burial site type?',
            okButton: {
                text: 'Yes, Delete Burial Site Type',
                callbackFunction: doDelete
            }
        });
    }
    function openEditBurialSiteType(clickEvent) {
        const burialSiteTypeId = Number.parseInt(clickEvent.currentTarget.closest('.container--burialSiteType').dataset.burialSiteTypeId ?? '', 10);
        const burialSiteType = burialSiteTypes.find((currentType) => burialSiteTypeId === currentType.burialSiteTypeId);
        let editCloseModalFunction;
        function doEdit(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateBurialSiteType`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                burialSiteTypeResponseHandler(responseJSON);
                if (responseJSON.success) {
                    editCloseModalFunction();
                }
            });
        }
        cityssm.openHtmlModal('adminBurialSiteTypes-edit', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                modalElement.querySelector('#burialSiteTypeEdit--burialSiteTypeId').value = burialSiteTypeId.toString();
                modalElement.querySelector('#burialSiteTypeEdit--burialSiteType').value = burialSiteType.burialSiteType;
                modalElement.querySelector('#burialSiteTypeEdit--bodyCapacityMax').value = burialSiteType.bodyCapacityMax?.toString() ?? '';
                modalElement.querySelector('#burialSiteTypeEdit--crematedCapacityMax').value = burialSiteType.crematedCapacityMax?.toString() ?? '';
            },
            onshown(modalElement, closeModalFunction) {
                editCloseModalFunction = closeModalFunction;
                modalElement.querySelector('#burialSiteTypeEdit--burialSiteType').focus();
                modalElement.querySelector('form')?.addEventListener('submit', doEdit);
                bulmaJS.toggleHtmlClipped();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function openAddBurialSiteTypeField(clickEvent) {
        const burialSiteTypeId = Number.parseInt(clickEvent.currentTarget.closest('.container--burialSiteType').dataset.burialSiteTypeId ?? '', 10);
        let addCloseModalFunction;
        function doAdd(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doAddBurialSiteTypeField`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                expandedBurialSiteTypes.add(burialSiteTypeId);
                burialSiteTypeResponseHandler(responseJSON);
                if (responseJSON.success) {
                    addCloseModalFunction();
                    openEditBurialSiteTypeField(burialSiteTypeId, responseJSON.burialSiteTypeFieldId);
                }
            });
        }
        cityssm.openHtmlModal('adminBurialSiteTypes-addField', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                if (burialSiteTypeId) {
                    ;
                    modalElement.querySelector('#burialSiteTypeFieldAdd--burialSiteTypeId').value = burialSiteTypeId.toString();
                }
            },
            onshown(modalElement, closeModalFunction) {
                addCloseModalFunction = closeModalFunction;
                modalElement.querySelector('#burialSiteTypeFieldAdd--burialSiteTypeField').focus();
                modalElement.querySelector('form')?.addEventListener('submit', doAdd);
                bulmaJS.toggleHtmlClipped();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function moveBurialSiteType(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const burialSiteTypeId = buttonElement.closest('.container--burialSiteType').dataset.burialSiteTypeId;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveBurialSiteTypeUp'
            : // eslint-disable-next-line no-secrets/no-secrets
                'doMoveBurialSiteTypeDown'}`, {
            burialSiteTypeId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, burialSiteTypeResponseHandler);
    }
    function openEditBurialSiteTypeField(burialSiteTypeId, burialSiteTypeFieldId) {
        const burialSiteType = burialSiteTypes.find((currentType) => currentType.burialSiteTypeId === burialSiteTypeId);
        const burialSiteTypeField = (burialSiteType.burialSiteTypeFields ?? []).find((currentField) => currentField.burialSiteTypeFieldId === burialSiteTypeFieldId);
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
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateBurialSiteTypeField`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                burialSiteTypeResponseHandler(responseJSON);
                if (responseJSON.success) {
                    editCloseModalFunction();
                }
            });
        }
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doDeleteBurialSiteTypeField`, {
                burialSiteTypeFieldId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                burialSiteTypeResponseHandler(responseJSON);
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
                    text: 'Yes, Delete Field',
                    callbackFunction: doDelete
                }
            });
        }
        cityssm.openHtmlModal('adminBurialSiteTypes-editField', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                modalElement.querySelector('#burialSiteTypeFieldEdit--burialSiteTypeFieldId').value = burialSiteTypeField.burialSiteTypeFieldId.toString();
                modalElement.querySelector('#burialSiteTypeFieldEdit--burialSiteTypeField').value = burialSiteTypeField.burialSiteTypeField ?? '';
                modalElement.querySelector('#burialSiteTypeFieldEdit--isRequired').value = burialSiteTypeField.isRequired ?? false ? '1' : '0';
                fieldTypeElement = modalElement.querySelector('#burialSiteTypeFieldEdit--fieldType');
                fieldTypeElement.value = burialSiteTypeField.fieldType;
                minLengthInputElement = modalElement.querySelector('#burialSiteTypeFieldEdit--minLength');
                minLengthInputElement.value =
                    burialSiteTypeField.minLength?.toString() ?? '';
                maxLengthInputElement = modalElement.querySelector('#burialSiteTypeFieldEdit--maxLength');
                maxLengthInputElement.value =
                    burialSiteTypeField.maxLength?.toString() ?? '';
                patternElement = modalElement.querySelector('#burialSiteTypeFieldEdit--pattern');
                patternElement.value = burialSiteTypeField.pattern ?? '';
                fieldValuesElement = modalElement.querySelector('#burialSiteTypeFieldEdit--fieldValues');
                fieldValuesElement.value = burialSiteTypeField.fieldValues ?? '';
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
                    .querySelector('#button--deleteBurialSiteTypeField')
                    ?.addEventListener('click', confirmDoDelete);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
                cityssm.disableNavBlocker();
            }
        });
    }
    function openEditBurialSiteTypeFieldByClick(clickEvent) {
        clickEvent.preventDefault();
        const burialSiteTypeFieldId = Number.parseInt(clickEvent.currentTarget.closest('.container--burialSiteTypeField').dataset.burialSiteTypeFieldId ?? '', 10);
        const burialSiteTypeId = Number.parseInt(clickEvent.currentTarget.closest('.container--burialSiteType').dataset.burialSiteTypeId ?? '', 10);
        openEditBurialSiteTypeField(burialSiteTypeId, burialSiteTypeFieldId);
    }
    function moveBurialSiteTypeField(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const burialSiteTypeFieldId = buttonElement.closest('.container--burialSiteTypeField').dataset.burialSiteTypeFieldId;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveBurialSiteTypeFieldUp'
            : // eslint-disable-next-line no-secrets/no-secrets
                'doMoveBurialSiteTypeFieldDown'}`, {
            burialSiteTypeFieldId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, burialSiteTypeResponseHandler);
    }
    function renderBurialSiteTypeFields(panelElement, burialSiteTypeId, burialSiteTypeFields) {
        if (burialSiteTypeFields.length === 0) {
            // eslint-disable-next-line no-unsanitized/method
            panelElement.insertAdjacentHTML('beforeend', `<div class="panel-block is-block
          ${expandedBurialSiteTypes.has(burialSiteTypeId) ? '' : ' is-hidden'}">
          <div class="message is-info"><p class="message-body">There are no additional fields.</p></div>
          </div>`);
        }
        else {
            for (const burialSiteTypeField of burialSiteTypeFields) {
                const panelBlockElement = document.createElement('div');
                panelBlockElement.className =
                    'panel-block is-block container--burialSiteTypeField';
                if (!expandedBurialSiteTypes.has(burialSiteTypeId)) {
                    panelBlockElement.classList.add('is-hidden');
                }
                panelBlockElement.dataset.burialSiteTypeFieldId =
                    burialSiteTypeField.burialSiteTypeFieldId.toString();
                // eslint-disable-next-line no-unsanitized/property
                panelBlockElement.innerHTML = `<div class="level is-mobile">
          <div class="level-left">
            <div class="level-item">
              <a class="has-text-weight-bold button--editBurialSiteTypeField" href="#">
                ${cityssm.escapeHTML(burialSiteTypeField.burialSiteTypeField ?? '')}
              </a>
            </div>
            <div class="level-item">
              <span class="tag">${burialSiteTypeField.fieldType}</span>
            </div>
          </div>
          <div class="level-right is-hidden-print">
            <div class="level-item">
              ${sunrise.getMoveUpDownButtonFieldHTML('button--moveBurialSiteTypeFieldUp', 
                // eslint-disable-next-line no-secrets/no-secrets
                'button--moveBurialSiteTypeFieldDown')}
            </div>
          </div>
          </div>`;
                panelBlockElement
                    .querySelector('.button--editBurialSiteTypeField')
                    ?.addEventListener('click', openEditBurialSiteTypeFieldByClick);
                panelBlockElement.querySelector('.button--moveBurialSiteTypeFieldUp').addEventListener('click', moveBurialSiteTypeField);
                panelBlockElement.querySelector('.button--moveBurialSiteTypeFieldDown').addEventListener('click', moveBurialSiteTypeField);
                panelElement.append(panelBlockElement);
            }
        }
    }
    function renderBurialSiteTypes() {
        containerElement.innerHTML = '';
        if (burialSiteTypes.length === 0) {
            containerElement.insertAdjacentHTML('afterbegin', `<div class="message is-warning">
          <p class="message-body">There are no active burial site types.</p>
          </div>`);
            return;
        }
        for (const burialSiteType of burialSiteTypes) {
            const burialSiteTypeContainer = document.createElement('div');
            burialSiteTypeContainer.className = 'panel container--burialSiteType';
            burialSiteTypeContainer.dataset.burialSiteTypeId =
                burialSiteType.burialSiteTypeId.toString();
            /*
             * Body Capacity Tag
              */
            let bodyCapacityMax = burialSiteType.bodyCapacityMax?.toString() ?? 'unlimited';
            if (bodyCapacityMax === '0') {
                bodyCapacityMax = 'none';
            }
            let bodyCapacityTagClass = 'is-info';
            if (bodyCapacityMax === 'none') {
                bodyCapacityTagClass = 'is-danger';
            }
            else if (bodyCapacityMax === 'unlimited') {
                bodyCapacityTagClass = 'is-success';
            }
            const bodiesTagHtml = `<div class="control">
        <div class="tags has-addons">
          <span class="tag is-dark">Bodies</span>
          <span class="tag ${bodyCapacityTagClass}">
            ${cityssm.escapeHTML(bodyCapacityMax)}
          </span>
        </div>
        </div>`;
            /*
             * Cremains Capacity Tag
             */
            let crematedCapacityMax = burialSiteType.crematedCapacityMax?.toString() ?? 'unlimited';
            if (crematedCapacityMax === '0') {
                crematedCapacityMax = 'none';
            }
            let crematedCapacityTagClass = 'is-info';
            if (crematedCapacityMax === 'none') {
                crematedCapacityTagClass = 'is-danger';
            }
            else if (crematedCapacityMax === 'unlimited') {
                crematedCapacityTagClass = 'is-success';
            }
            const crematedTagHtml = `<div class="control">
        <div class="tags has-addons">
          <span class="tag is-dark">Cremains</span>
          <span class="tag ${crematedCapacityTagClass}">
            ${cityssm.escapeHTML(crematedCapacityMax)}
          </span>
        </div>
        </div>`;
            // eslint-disable-next-line no-unsanitized/property
            burialSiteTypeContainer.innerHTML = `<div class="panel-heading">
        <div class="columns is-vcentered">
          <div class="column is-narrow">
            <button class="button is-small button--toggleBurialSiteTypeFields" title="Toggle Fields" type="button">
              <span class="icon">
                ${expandedBurialSiteTypes.has(burialSiteType.burialSiteTypeId)
                ? '<i class="fa-solid fa-minus"></i>'
                : '<i class="fa-solid fa-plus"></i>'}
              </span>
            </button>
          </div>
          <div class="column is-narrow">
            <h2 class="title is-5 has-text-white">${cityssm.escapeHTML(burialSiteType.burialSiteType)}</h2>
          </div>
          <div class="column">
            <div class="field is-grouped is-grouped-multiline">
            ${bodiesTagHtml}
            ${crematedTagHtml}
            </div>
          </div>
          <div class="column is-narrow is-hidden-print">
            <div class="buttons">
              <button class="button is-danger is-small button--deleteBurialSiteType" type="button">
                <span class="icon is-small"><i class="fa-solid fa-trash"></i></span>
                <span>Delete</span>
              </button>

              <button class="button is-primary is-small button--editBurialSiteType" type="button">
                <span class="icon is-small"><i class="fa-solid fa-pencil-alt"></i></span>
                <span>Edit <span class="is-hidden-desktop-only is-hidden-tablet-only">Burial Site Type</span></span>
              </button>

              <button class="button is-success is-small button--addBurialSiteTypeField" type="button">
                <span class="icon is-small"><i class="fa-solid fa-plus"></i></span>
                <span>Add Field</span>
              </button>

              ${sunrise.getMoveUpDownButtonFieldHTML('button--moveBurialSiteTypeUp', 'button--moveBurialSiteTypeDown')}
            </div>
          </div>
        </div>
        </div>`;
            renderBurialSiteTypeFields(burialSiteTypeContainer, burialSiteType.burialSiteTypeId, burialSiteType.burialSiteTypeFields ?? []);
            burialSiteTypeContainer
                .querySelector('.button--toggleBurialSiteTypeFields')
                ?.addEventListener('click', toggleBurialSiteTypeFields);
            burialSiteTypeContainer
                .querySelector('.button--deleteBurialSiteType')
                ?.addEventListener('click', deleteBurialSiteType);
            burialSiteTypeContainer
                .querySelector('.button--editBurialSiteType')
                ?.addEventListener('click', openEditBurialSiteType);
            burialSiteTypeContainer
                .querySelector('.button--addBurialSiteTypeField')
                ?.addEventListener('click', openAddBurialSiteTypeField);
            burialSiteTypeContainer.querySelector('.button--moveBurialSiteTypeUp').addEventListener('click', moveBurialSiteType);
            burialSiteTypeContainer.querySelector('.button--moveBurialSiteTypeDown').addEventListener('click', moveBurialSiteType);
            containerElement.append(burialSiteTypeContainer);
        }
    }
    document
        .querySelector('#button--addBurialSiteType')
        ?.addEventListener('click', () => {
        let addCloseModalFunction;
        function doAdd(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doAddBurialSiteType`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    addCloseModalFunction();
                    burialSiteTypes = responseJSON.burialSiteTypes;
                    renderBurialSiteTypes();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Burial Site Type',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        cityssm.openHtmlModal('adminBurialSiteTypes-add', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                modalElement.querySelector('#burialSiteTypeAdd--bodyCapacityMax').value = exports.bodyCapacityMaxDefault.toString();
                modalElement.querySelector('#burialSiteTypeAdd--crematedCapacityMax').value = exports.crematedCapacityMaxDefault.toString();
            },
            onshown(modalElement, closeModalFunction) {
                addCloseModalFunction = closeModalFunction;
                modalElement.querySelector('#burialSiteTypeAdd--burialSiteType').focus();
                modalElement.querySelector('form')?.addEventListener('submit', doAdd);
                bulmaJS.toggleHtmlClipped();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
    renderBurialSiteTypes();
})();

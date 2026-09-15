{
    const sunrise = exports.sunrise;
    let serviceTypes = exports.serviceTypes;
    delete exports.serviceTypes;
    function updateServiceType(submitEvent) {
        submitEvent.preventDefault();
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateServiceType`, submitEvent.currentTarget, (responseJSON) => {
            if (responseJSON.success) {
                serviceTypes = responseJSON.serviceTypes;
                bulmaJS.alert({
                    contextualColorName: 'success',
                    message: 'Service Type Updated Successfully'
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Updating Service Type',
                    message: responseJSON.errorMessage
                });
            }
        });
    }
    function deleteServiceType(clickEvent) {
        const tableRowElement = clickEvent.currentTarget.closest('tr');
        const serviceTypeId = tableRowElement.dataset.serviceTypeId;
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doDeleteServiceType`, {
                serviceTypeId
            }, (responseJSON) => {
                if (responseJSON.success) {
                    serviceTypes = responseJSON.serviceTypes;
                    if (serviceTypes.length === 0) {
                        renderServiceTypes();
                    }
                    else {
                        tableRowElement.remove();
                        document.querySelector('#tag--serviceTypes').textContent = serviceTypes.length.toString();
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Service Type Deleted Successfully'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Deleting Service Type',
                        message: responseJSON.errorMessage
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Service Type',
            message: `Are you sure you want to delete this type?<br />
          Note that no contracts will be removed.`,
            messageIsHtml: true,
            okButton: {
                callbackFunction: doDelete,
                text: 'Yes, Delete Type'
            }
        });
    }
    function moveServiceType(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const tableRowElement = buttonElement.closest('tr');
        const serviceTypeId = tableRowElement.dataset.serviceTypeId;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveServiceTypeUp'
            : 'doMoveServiceTypeDown'}`, {
            serviceTypeId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, (responseJSON) => {
            if (responseJSON.success) {
                serviceTypes = responseJSON.serviceTypes;
                renderServiceTypes();
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Moving Service Type',
                    message: responseJSON.errorMessage
                });
            }
        });
    }
    function renderServiceTypes() {
        ;
        document.querySelector('#tag--serviceTypes').textContent =
            serviceTypes.length.toString();
        const containerElement = document.querySelector('#container--serviceTypes');
        if (serviceTypes.length === 0) {
            containerElement.innerHTML = `
        <tr>
          <td colspan="${sunrise.portalIntegrationIsEnabled ? '3' : '2'}">
            <div class="message is-warning">
              <p class="message-body">There are no active service types.</p>
            </div>
          </td>
        </tr>
      `;
            return;
        }
        containerElement.replaceChildren();
        for (const serviceType of serviceTypes) {
            const tableRowElement = document.createElement('tr');
            tableRowElement.dataset.serviceTypeId =
                serviceType.serviceTypeId.toString();
            const formId = `form--editServiceType--${serviceType.serviceTypeId.toString()}`;
            tableRowElement.insertAdjacentHTML('beforeend', `
          <td>
            <form id="${cityssm.escapeHTML(formId)}">
              <input name="serviceTypeId" type="hidden" value="${cityssm.escapeHTML(serviceType.serviceTypeId.toString())}" />
              <div class="field">
                <div class="control">
                  <input
                    class="input"
                    name="serviceType"
                    type="text"
                    value="${cityssm.escapeHTML(serviceType.serviceType)}"
                    maxlength="100"
                    aria-label="Service Type"
                    required
                  />
                </div>
              </div>
            </form>
          </td>
        `);
            if (sunrise.portalIntegrationIsEnabled) {
                tableRowElement.insertAdjacentHTML('beforeend', `
            <td>
              <div class="control">
                <div class="select is-fullwidth">
                  <select name="isAvailableOnPortal" aria-label="Sync with Portal" form="${cityssm.escapeHTML(formId)}">
                    <option value="0" ${serviceType.isAvailableOnPortal ? '' : ' selected'}>No</option>
                    <option value="1" ${serviceType.isAvailableOnPortal ? ' selected' : ''}>Yes, Sync</option>
                  </select>
                </div>
              </div>
            </td>
          `);
            }
            tableRowElement.insertAdjacentHTML('beforeend', `
          <td class="is-nowrap">
            <div class="field is-grouped">
              <div class="control">
                <button
                  class="button is-success"
                  type="submit"
                  aria-label="Save"
                  form="${cityssm.escapeHTML(formId)}"
                >
                  <span class="icon"><i class="fa-solid fa-save"></i></span>
                </button>
              </div>
              <div class="control">
                ${sunrise.getMoveUpDownButtonFieldHTML('button--moveServiceTypeUp', 'button--moveServiceTypeDown', false)}
              </div>
              <div class="control">
                <button
                  class="button is-danger is-light button--deleteServiceType"
                  type="button"
                  title="Delete Type"
                >
                  <span class="icon"><i class="fa-solid fa-trash"></i></span>
                </button>
              </div>
            </div>
          </td>
        `);
            tableRowElement
                .querySelector('form')
                ?.addEventListener('submit', updateServiceType);
            for (const moveButton of tableRowElement.querySelectorAll('.button--moveServiceTypeUp, .button--moveServiceTypeDown')) {
                moveButton.addEventListener('click', moveServiceType);
            }
            tableRowElement
                .querySelector('.button--deleteServiceType')
                ?.addEventListener('click', deleteServiceType);
            containerElement.append(tableRowElement);
        }
    }
    document
        .querySelector('#form--addServiceType')
        ?.addEventListener('submit', (submitEvent) => {
        submitEvent.preventDefault();
        const formElement = submitEvent.currentTarget;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doAddServiceType`, formElement, (responseJSON) => {
            serviceTypes = responseJSON.serviceTypes;
            renderServiceTypes();
            formElement.reset();
            formElement.querySelector('input')?.focus();
        });
    });
    renderServiceTypes();
}

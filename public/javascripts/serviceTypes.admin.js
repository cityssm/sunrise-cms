(() => {
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
        const containerElement = document.querySelector('#container--serviceTypes');
        if (serviceTypes.length === 0) {
            containerElement.innerHTML = /* html */ `
        <tr>
          <td colspan="2">
            <div class="message is-warning">
              <p class="message-body">There are no active service types.</p>
            </div>
          </td>
        </tr>
      `;
            return;
        }
        containerElement.innerHTML = '';
        for (const serviceType of serviceTypes) {
            const tableRowElement = document.createElement('tr');
            tableRowElement.dataset.serviceTypeId =
                serviceType.serviceTypeId.toString();
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = /* html */ `
        <td>
          <form>
            <input name="serviceTypeId" type="hidden" value="${serviceType.serviceTypeId.toString()}" />
            <div class="field has-addons">
              <div class="control is-expanded">
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
              <div class="control">
                <button class="button is-success" type="submit" aria-label="Save">
                  <span class="icon"><i class="fa-solid fa-save"></i></span>
                </button>
              </div>
            </div>
          </form>
        </td>
        <td class="is-nowrap">
          <div class="field is-grouped">
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
      `;
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
})();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    let burialSiteStatuses = exports.burialSiteStatuses;
    delete exports.burialSiteStatuses;
    function updateBurialSiteStatus(submitEvent) {
        submitEvent.preventDefault();
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateBurialSiteStatus`, submitEvent.currentTarget, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                burialSiteStatuses = responseJSON.burialSiteStatuses;
                bulmaJS.alert({
                    message: 'Burial Site Status Updated Successfully',
                    contextualColorName: 'success'
                });
            }
            else {
                bulmaJS.alert({
                    title: 'Error Updating Burial Site Status',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    function deleteBurialSiteStatus(clickEvent) {
        const tableRowElement = clickEvent.currentTarget.closest('tr');
        const burialSiteStatusId = tableRowElement.dataset.burialSiteStatusId;
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doDeleteBurialSiteStatus`, {
                burialSiteStatusId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    burialSiteStatuses = responseJSON.burialSiteStatuses;
                    if (burialSiteStatuses.length === 0) {
                        renderBurialSiteStatuses();
                    }
                    else {
                        tableRowElement.remove();
                    }
                    bulmaJS.alert({
                        message: 'Burial Site Status Deleted Successfully',
                        contextualColorName: 'success'
                    });
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Deleting Burial Site Status',
                        message: responseJSON.errorMessage ?? '',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Delete Burial Site Status',
            message: `Are you sure you want to delete this status?<br />
          Note that no burial sites will be removed.`,
            messageIsHtml: true,
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete Status',
                callbackFunction: doDelete
            }
        });
    }
    function moveBurialSiteStatus(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const tableRowElement = buttonElement.closest('tr');
        const burialSiteStatusId = tableRowElement.dataset.burialSiteStatusId;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveBurialSiteStatusUp'
            : 'doMoveBurialSiteStatusDown'}`, {
            burialSiteStatusId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                burialSiteStatuses = responseJSON.burialSiteStatuses;
                renderBurialSiteStatuses();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Moving Burial Site Status',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    function renderBurialSiteStatuses() {
        const containerElement = document.querySelector('#container--burialSiteStatuses');
        if (burialSiteStatuses.length === 0) {
            containerElement.innerHTML = `<tr><td colspan="2">
          <div class="message is-warning">
            <p class="message-body">There are no active burial site statuses.</p>
          </div>
          </td></tr>`;
            return;
        }
        containerElement.innerHTML = '';
        for (const burialSiteStatus of burialSiteStatuses) {
            const tableRowElement = document.createElement('tr');
            tableRowElement.dataset.burialSiteStatusId =
                burialSiteStatus.burialSiteStatusId.toString();
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = `<td>
        <form>
          <input name="burialSiteStatusId" type="hidden" value="${burialSiteStatus.burialSiteStatusId.toString()}" />
          <div class="field has-addons">
            <div class="control is-expanded">
              <input class="input" name="burialSiteStatus" type="text"
                value="${cityssm.escapeHTML(burialSiteStatus.burialSiteStatus)}"
                aria-label="Burial Site Status" maxlength="100" required />
            </div>
            <div class="control">
              <button class="button is-success" type="submit" aria-label="Save">
                <span class="icon"><i class="fas fa-save" aria-hidden="true"></i></span>
              </button>
            </div>
          </div>
        </form>
      </td><td class="is-nowrap">
        <div class="field is-grouped">
          <div class="control">
            ${sunrise.getMoveUpDownButtonFieldHTML('button--moveBurialSiteStatusUp', 'button--moveBurialSiteStatusDown', false)}
          </div>
          <div class="control">
            <button class="button is-danger is-light button--deleteBurialSiteStatus" data-tooltip="Delete Status" type="button" aria-label="Delete Status">
              <span class="icon"><i class="fas fa-trash" aria-hidden="true"></i></span>
            </button>
          </div>
        </div>
      </td>`;
            tableRowElement
                .querySelector('form')
                ?.addEventListener('submit', updateBurialSiteStatus);
            tableRowElement.querySelector('.button--moveBurialSiteStatusUp').addEventListener('click', moveBurialSiteStatus);
            tableRowElement.querySelector('.button--moveBurialSiteStatusDown').addEventListener('click', moveBurialSiteStatus);
            tableRowElement
                .querySelector('.button--deleteBurialSiteStatus')
                ?.addEventListener('click', deleteBurialSiteStatus);
            containerElement.append(tableRowElement);
        }
    }
    ;
    document.querySelector('#form--addBurialSiteStatus').addEventListener('submit', (submitEvent) => {
        submitEvent.preventDefault();
        const formElement = submitEvent.currentTarget;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doAddBurialSiteStatus`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                burialSiteStatuses = responseJSON.burialSiteStatuses;
                renderBurialSiteStatuses();
                formElement.reset();
                formElement.querySelector('input')?.focus();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Adding Burial Site Status',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
                });
            }
        });
    });
    renderBurialSiteStatuses();
})();

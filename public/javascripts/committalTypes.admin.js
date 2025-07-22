"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    let committalTypes = exports.committalTypes;
    delete exports.committalTypes;
    function updateCommittalType(submitEvent) {
        submitEvent.preventDefault();
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateCommittalType`, submitEvent.currentTarget, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                committalTypes = responseJSON.committalTypes;
                bulmaJS.alert({
                    contextualColorName: 'success',
                    message: 'Committal Type Updated Successfully'
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Updating Committal Type',
                    message: responseJSON.errorMessage ?? ''
                });
            }
        });
    }
    function deleteCommittalType(clickEvent) {
        const tableRowElement = clickEvent.currentTarget.closest('tr');
        const committalTypeId = tableRowElement.dataset.committalTypeId;
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doDeleteCommittalType`, {
                committalTypeId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    committalTypes = responseJSON.committalTypes;
                    if (committalTypes.length === 0) {
                        renderCommittalTypes();
                    }
                    else {
                        tableRowElement.remove();
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Committal Type Deleted Successfully'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Deleting Committal Type',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Committal Type',
            message: `Are you sure you want to delete this type?<br />
          Note that no contracts will be removed.`,
            messageIsHtml: true,
            okButton: {
                callbackFunction: doDelete,
                text: 'Yes, Delete Type'
            }
        });
    }
    function moveCommittalType(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const tableRowElement = buttonElement.closest('tr');
        const committalTypeId = tableRowElement.dataset.committalTypeId;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveCommittalTypeUp'
            : 'doMoveCommittalTypeDown'}`, {
            committalTypeId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                committalTypes = responseJSON.committalTypes;
                renderCommittalTypes();
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Moving Committal Type',
                    message: responseJSON.errorMessage ?? ''
                });
            }
        });
    }
    function renderCommittalTypes() {
        const containerElement = document.querySelector('#container--committalTypes');
        if (committalTypes.length === 0) {
            containerElement.innerHTML = `<tr><td colspan="2">
          <div class="message is-warning">
            <p class="message-body">There are no active committal types.</p>
          </div>
          </td></tr>`;
            return;
        }
        containerElement.innerHTML = '';
        for (const committalType of committalTypes) {
            const tableRowElement = document.createElement('tr');
            tableRowElement.dataset.committalTypeId =
                committalType.committalTypeId.toString();
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = `<td>
        <form>
          <input name="committalTypeId" type="hidden" value="${committalType.committalTypeId.toString()}" />
          <div class="field has-addons">
            <div class="control is-expanded">
              <input class="input" name="committalType" type="text"
                value="${cityssm.escapeHTML(committalType.committalType)}"
                aria-label="Committal Type" maxlength="100" required />
            </div>
            <div class="control">
              <button class="button is-success" type="submit" aria-label="Save">
                <span class="icon"><i class="fa-solid fa-save"></i></span>
              </button>
            </div>
          </div>
        </form>
      </td><td class="is-nowrap">
        <div class="field is-grouped">
          <div class="control">
            ${sunrise.getMoveUpDownButtonFieldHTML('button--moveCommittalTypeUp', 'button--moveCommittalTypeDown', false)}
          </div>
          <div class="control">
            <button class="button is-danger is-light button--deleteCommittalType" data-tooltip="Delete Type" type="button" aria-label="Delete Type">
              <span class="icon"><i class="fa-solid fa-trash"></i></span>
            </button>
          </div>
        </div>
      </td>`;
            tableRowElement
                .querySelector('form')
                ?.addEventListener('submit', updateCommittalType);
            tableRowElement.querySelector('.button--moveCommittalTypeUp').addEventListener('click', moveCommittalType);
            tableRowElement.querySelector('.button--moveCommittalTypeDown').addEventListener('click', moveCommittalType);
            tableRowElement
                .querySelector('.button--deleteCommittalType')
                ?.addEventListener('click', deleteCommittalType);
            containerElement.append(tableRowElement);
        }
    }
    ;
    document.querySelector('#form--addCommittalType').addEventListener('submit', (submitEvent) => {
        submitEvent.preventDefault();
        const formElement = submitEvent.currentTarget;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doAddCommittalType`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                committalTypes = responseJSON.committalTypes;
                renderCommittalTypes();
                formElement.reset();
                formElement.querySelector('input')?.focus();
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Adding Committal Type',
                    message: responseJSON.errorMessage ?? ''
                });
            }
        });
    });
    renderCommittalTypes();
})();

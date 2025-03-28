"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    /**
     * Work Order Types
     */
    let workOrderTypes = exports.workOrderTypes;
    delete exports.workOrderTypes;
    function updateWorkOrderType(submitEvent) {
        submitEvent.preventDefault();
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateWorkOrderType`, submitEvent.currentTarget, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                workOrderTypes = responseJSON.workOrderTypes;
                bulmaJS.alert({
                    message: 'Work Order Type Updated Successfully',
                    contextualColorName: 'success'
                });
            }
            else {
                bulmaJS.alert({
                    title: 'Error Updating Work Order Type',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    function deleteWorkOrderType(clickEvent) {
        const tableRowElement = clickEvent.currentTarget.closest('tr');
        const workOrderTypeId = tableRowElement.dataset.workOrderTypeId;
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doDeleteWorkOrderType`, {
                workOrderTypeId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    workOrderTypes = responseJSON.workOrderTypes;
                    if (workOrderTypes.length === 0) {
                        renderWorkOrderTypes();
                    }
                    else {
                        tableRowElement.remove();
                    }
                    bulmaJS.alert({
                        message: 'Work Order Type Deleted Successfully',
                        contextualColorName: 'success'
                    });
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Deleting Work Order Type',
                        message: responseJSON.errorMessage ?? '',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Delete Work Order Type',
            message: `Are you sure you want to delete this work order type?<br />
          Note that no work orders will be removed.`,
            messageIsHtml: true,
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete Work Order Type',
                callbackFunction: doDelete
            }
        });
    }
    function moveWorkOrderType(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const tableRowElement = buttonElement.closest('tr');
        const workOrderTypeId = tableRowElement.dataset.workOrderTypeId;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveWorkOrderTypeUp'
            : 'doMoveWorkOrderTypeDown'}`, {
            workOrderTypeId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                workOrderTypes = responseJSON.workOrderTypes;
                renderWorkOrderTypes();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Moving Work Order Type',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    function renderWorkOrderTypes() {
        const containerElement = document.querySelector('#container--workOrderTypes');
        if (workOrderTypes.length === 0) {
            containerElement.innerHTML = `<tr><td colspan="2">
          <div class="message is-warning"><p class="message-body">There are no active work order types.</p></div>
          </td></tr>`;
            return;
        }
        containerElement.innerHTML = '';
        for (const workOrderType of workOrderTypes) {
            const tableRowElement = document.createElement('tr');
            tableRowElement.dataset.workOrderTypeId =
                workOrderType.workOrderTypeId.toString();
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = `<td>
        <form>
          <input name="workOrderTypeId" type="hidden" value="${workOrderType.workOrderTypeId.toString()}" />
          <div class="field has-addons">
            <div class="control">
              <input class="input" name="workOrderType" type="text"
                value="${cityssm.escapeHTML(workOrderType.workOrderType ?? '')}" maxlength="100" aria-label="Work Order Type" required />
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
            ${sunrise.getMoveUpDownButtonFieldHTML('button--moveWorkOrderTypeUp', 'button--moveWorkOrderTypeDown', false)}
          </div>
          <div class="control">
            <button class="button is-danger is-light button--deleteWorkOrderType" data-tooltip="Delete Work Order Type" type="button" aria-label="Delete Work Order Type">
              <span class="icon"><i class="fas fa-trash" aria-hidden="true"></i></span>
            </button>
          </div>
        </div>
      </td>`;
            tableRowElement
                .querySelector('form')
                ?.addEventListener('submit', updateWorkOrderType);
            tableRowElement.querySelector('.button--moveWorkOrderTypeUp').addEventListener('click', moveWorkOrderType);
            tableRowElement.querySelector('.button--moveWorkOrderTypeDown').addEventListener('click', moveWorkOrderType);
            tableRowElement
                .querySelector('.button--deleteWorkOrderType')
                ?.addEventListener('click', deleteWorkOrderType);
            containerElement.append(tableRowElement);
        }
    }
    ;
    document.querySelector('#form--addWorkOrderType').addEventListener('submit', (submitEvent) => {
        submitEvent.preventDefault();
        const formElement = submitEvent.currentTarget;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doAddWorkOrderType`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                workOrderTypes = responseJSON.workOrderTypes;
                renderWorkOrderTypes();
                formElement.reset();
                formElement.querySelector('input')?.focus();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Adding Work Order Type',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
                });
            }
        });
    });
    renderWorkOrderTypes();
    /**
     * Work Order Milestone Types
     */
    let workOrderMilestoneTypes = exports.workOrderMilestoneTypes;
    delete exports.workOrderMilestoneTypes;
    function updateWorkOrderMilestoneType(submitEvent) {
        submitEvent.preventDefault();
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateWorkOrderMilestoneType`, submitEvent.currentTarget, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                workOrderMilestoneTypes = responseJSON.workOrderMilestoneTypes;
                bulmaJS.alert({
                    message: 'Work Order Milestone Type Updated Successfully',
                    contextualColorName: 'success'
                });
            }
            else {
                bulmaJS.alert({
                    title: 'Error Updating Work Order Milestone Type',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    function deleteWorkOrderMilestoneType(clickEvent) {
        const tableRowElement = clickEvent.currentTarget.closest('tr');
        const workOrderMilestoneTypeId = tableRowElement.dataset.workOrderMilestoneTypeId;
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/admin/doDeleteWorkOrderMilestoneType`, {
                workOrderMilestoneTypeId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    workOrderMilestoneTypes = responseJSON.workOrderMilestoneTypes;
                    if (workOrderMilestoneTypes.length === 0) {
                        renderWorkOrderMilestoneTypes();
                    }
                    else {
                        tableRowElement.remove();
                    }
                    bulmaJS.alert({
                        message: 'Work Order Milestone Type Deleted Successfully',
                        contextualColorName: 'success'
                    });
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Deleting Work Order Milestone Type',
                        message: responseJSON.errorMessage ?? '',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Delete Work Order Milestone Type',
            message: `Are you sure you want to delete this work order milestone type?<br />
          Note that no work orders will be removed.`,
            messageIsHtml: true,
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete Work Order Milestone Type',
                callbackFunction: doDelete
            }
        });
    }
    function moveWorkOrderMilestoneType(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const tableRowElement = buttonElement.closest('tr');
        const workOrderMilestoneTypeId = tableRowElement.dataset.workOrderMilestoneTypeId;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/${buttonElement.dataset.direction === 'up'
            ? 'doMoveWorkOrderMilestoneTypeUp'
            : 'doMoveWorkOrderMilestoneTypeDown'}`, {
            workOrderMilestoneTypeId,
            moveToEnd: clickEvent.shiftKey ? '1' : '0'
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                workOrderMilestoneTypes = responseJSON.workOrderMilestoneTypes;
                renderWorkOrderMilestoneTypes();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Moving Work Order Milestone Type',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    function renderWorkOrderMilestoneTypes() {
        const containerElement = document.querySelector('#container--workOrderMilestoneTypes');
        if (workOrderMilestoneTypes.length === 0) {
            containerElement.innerHTML = `<tr><td colspan="2">
          <div class="message is-warning">
            <p class="message-body">There are no active work order milestone types.</p>
          </div>
          </td></tr>`;
            return;
        }
        containerElement.innerHTML = '';
        for (const workOrderMilestoneType of workOrderMilestoneTypes) {
            const tableRowElement = document.createElement('tr');
            tableRowElement.dataset.workOrderMilestoneTypeId =
                workOrderMilestoneType.workOrderMilestoneTypeId.toString();
            // eslint-disable-next-line no-unsanitized/property, no-secrets/no-secrets
            tableRowElement.innerHTML = `<td>
        <form>
          <input name="workOrderMilestoneTypeId" type="hidden"
            value="${workOrderMilestoneType.workOrderMilestoneTypeId.toString()}" />
          <div class="field has-addons">
            <div class="control">
              <input class="input"
                name="workOrderMilestoneType" type="text"
                value="${cityssm.escapeHTML(workOrderMilestoneType.workOrderMilestoneType)}"
                maxlength="100"
                aria-label="Work Order Milestone Type" required />
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
            ${sunrise.getMoveUpDownButtonFieldHTML('button--moveWorkOrderMilestoneTypeUp', 'button--moveWorkOrderMilestoneTypeDown', false)}
          </div>
          <div class="control">
            <button class="button is-danger is-light button--deleteWorkOrderMilestoneType" data-tooltip="Delete Milestone Type" type="button" aria-label="Delete Milestone Type">
              <span class="icon"><i class="fas fa-trash" aria-hidden="true"></i></span>
            </button>
          </div>
        </div>
      </td>`;
            tableRowElement
                .querySelector('form')
                ?.addEventListener('submit', updateWorkOrderMilestoneType);
            tableRowElement
                .querySelector('.button--moveWorkOrderMilestoneTypeUp')
                ?.addEventListener('click', moveWorkOrderMilestoneType);
            tableRowElement
                .querySelector('.button--moveWorkOrderMilestoneTypeDown')
                ?.addEventListener('click', moveWorkOrderMilestoneType);
            tableRowElement
                .querySelector('.button--deleteWorkOrderMilestoneType')
                ?.addEventListener('click', deleteWorkOrderMilestoneType);
            containerElement.append(tableRowElement);
        }
    }
    document
        .querySelector('#form--addWorkOrderMilestoneType')
        ?.addEventListener('submit', (submitEvent) => {
        submitEvent.preventDefault();
        const formElement = submitEvent.currentTarget;
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doAddWorkOrderMilestoneType`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                workOrderMilestoneTypes = responseJSON.workOrderMilestoneTypes;
                renderWorkOrderMilestoneTypes();
                formElement.reset();
                formElement.querySelector('input')?.focus();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Adding Work Order Milestone Type',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
                });
            }
        });
    });
    renderWorkOrderMilestoneTypes();
    /**
     * Burial Site Statuses
     */
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
            <div class="control">
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

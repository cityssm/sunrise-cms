(() => {
    const sunrise = exports.sunrise;
    let workOrderMilestoneTypes = exports.workOrderMilestoneTypes;
    delete exports.workOrderMilestoneTypes;
    function updateWorkOrderMilestoneType(submitEvent) {
        submitEvent.preventDefault();
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateWorkOrderMilestoneType`, submitEvent.currentTarget, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                workOrderMilestoneTypes = responseJSON.workOrderMilestoneTypes;
                bulmaJS.alert({
                    contextualColorName: 'success',
                    message: 'Work Order Milestone Type Updated Successfully'
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Updating Work Order Milestone Type',
                    message: responseJSON.errorMessage ?? ''
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
                        contextualColorName: 'success',
                        message: 'Work Order Milestone Type Deleted Successfully'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Deleting Work Order Milestone Type',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Work Order Milestone Type',
            message: `Are you sure you want to delete this work order milestone type?<br />
          Note that no work orders will be removed.`,
            messageIsHtml: true,
            okButton: {
                callbackFunction: doDelete,
                text: 'Yes, Delete Work Order Milestone Type'
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
                    contextualColorName: 'danger',
                    title: 'Error Moving Work Order Milestone Type',
                    message: responseJSON.errorMessage ?? ''
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
            /* eslint-disable no-secrets/no-secrets */
            tableRowElement.innerHTML = `<td>
          <form>
            <input name="workOrderMilestoneTypeId" type="hidden"
              value="${cityssm.escapeHTML(workOrderMilestoneType.workOrderMilestoneTypeId.toString())}" />
            <div class="field has-addons">
              <div class="control is-expanded">
                <input class="input"
                  name="workOrderMilestoneType" type="text"
                  value="${cityssm.escapeHTML(workOrderMilestoneType.workOrderMilestoneType)}"
                  maxlength="100"
                  aria-label="Work Order Milestone Type" required />
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
              ${sunrise.getMoveUpDownButtonFieldHTML('button--moveWorkOrderMilestoneTypeUp', 'button--moveWorkOrderMilestoneTypeDown', false)}
            </div>
            <div class="control">
              <button class="button is-danger is-light button--deleteWorkOrderMilestoneType" title="Delete Milestone Type" type="button">
                <span class="icon"><i class="fa-solid fa-trash"></i></span>
              </button>
            </div>
          </div>
        </td>`;
            /* eslint-enable no-secrets/no-secrets */
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
                    contextualColorName: 'danger',
                    title: 'Error Adding Work Order Milestone Type',
                    message: responseJSON.errorMessage ?? ''
                });
            }
        });
    });
    renderWorkOrderMilestoneTypes();
})();

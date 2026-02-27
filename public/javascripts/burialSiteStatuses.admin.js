(() => {
    const sunrise = exports.sunrise;
    let burialSiteStatuses = exports.burialSiteStatuses;
    delete exports.burialSiteStatuses;
    function updateBurialSiteStatus(submitEvent) {
        submitEvent.preventDefault();
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doUpdateBurialSiteStatus`, submitEvent.currentTarget, (responseJSON) => {
            if (responseJSON.success) {
                burialSiteStatuses = responseJSON.burialSiteStatuses;
                bulmaJS.alert({
                    contextualColorName: 'success',
                    message: 'Burial Site Status Updated Successfully'
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: 'Error Updating Burial Site Status'
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
            }, (responseJSON) => {
                if (responseJSON.success) {
                    burialSiteStatuses = responseJSON.burialSiteStatuses;
                    if (burialSiteStatuses.length === 0) {
                        renderBurialSiteStatuses();
                    }
                    else {
                        tableRowElement.remove();
                    }
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Burial Site Status Deleted Successfully'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        message: 'Error Deleting Burial Site Status'
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Burial Site Status',
            message: `Are you sure you want to delete this status?<br />
          Note that no burial sites will be removed.`,
            messageIsHtml: true,
            okButton: {
                callbackFunction: doDelete,
                text: 'Yes, Delete Status'
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
        }, (responseJSON) => {
            if (responseJSON.success) {
                burialSiteStatuses = responseJSON.burialSiteStatuses;
                renderBurialSiteStatuses();
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    message: 'Error Moving Burial Site Status'
                });
            }
        });
    }
    function renderBurialSiteStatuses() {
        const containerElement = document.querySelector('#container--burialSiteStatuses');
        if (burialSiteStatuses.length === 0) {
            containerElement.innerHTML = /* html */ `
        <tr>
          <td colspan="2">
            <div class="message is-warning">
              <p class="message-body">There are no active burial site statuses.</p>
            </div>
          </td>
        </tr>
      `;
            return;
        }
        containerElement.innerHTML = '';
        for (const burialSiteStatus of burialSiteStatuses) {
            const tableRowElement = document.createElement('tr');
            tableRowElement.dataset.burialSiteStatusId =
                burialSiteStatus.burialSiteStatusId.toString();
            tableRowElement.innerHTML = /* html */ `
        <td>
          <form>
            <input name="burialSiteStatusId" type="hidden"
              value="${cityssm.escapeHTML(burialSiteStatus.burialSiteStatusId.toString())}"
            />
            <div class="field has-addons">
              <div class="control is-expanded">
                <input
                  class="input"
                  name="burialSiteStatus"
                  type="text"
                  value="${cityssm.escapeHTML(burialSiteStatus.burialSiteStatus)}"
                  maxlength="100"
                  aria-label="Burial Site Status"
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
              ${sunrise.getMoveUpDownButtonFieldHTML('button--moveBurialSiteStatusUp', 'button--moveBurialSiteStatusDown', false)}
            </div>
            <div class="control">
              <button
                class="button is-danger is-light button--deleteBurialSiteStatus"
                type="button"
                title="Delete Status"
              >
                <span class="icon"><i class="fa-solid fa-trash"></i></span>
              </button>
            </div>
          </div>
        </td>
      `;
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
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doAddBurialSiteStatus`, formElement, (responseJSON) => {
            burialSiteStatuses = responseJSON.burialSiteStatuses;
            renderBurialSiteStatuses();
            formElement.reset();
            formElement.querySelector('input')?.focus();
        });
    });
    renderBurialSiteStatuses();
})();

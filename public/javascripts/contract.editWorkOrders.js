/* eslint-disable no-secrets/no-secrets */
(() => {
    const sunrise = exports.sunrise;
    const contractId = document.querySelector('#contract--contractId').value;
    function confirmOpenNewWorkOrder(workOrderId) {
        bulmaJS.confirm({
            contextualColorName: 'success',
            title: 'Work Order Created Successfully',
            message: 'Would you like to open the work order now?',
            okButton: {
                callbackFunction() {
                    globalThis.location.href = sunrise.getWorkOrderUrl(workOrderId, true);
                },
                text: 'Yes, Open the Work Order'
            }
        });
    }
    document
        .querySelector('#button--createWorkOrder')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        const currentDateString = cityssm.dateToString(new Date());
        let defaultMilestoneDateString = document.querySelector('#contract--funeralDateString').value;
        if (defaultMilestoneDateString === '' ||
            defaultMilestoneDateString < currentDateString) {
            defaultMilestoneDateString = currentDateString;
        }
        let createCloseModalFunction;
        function doCreate(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/workOrders/doCreateWorkOrder`, formEvent.currentTarget, (responseJSON) => {
                if (responseJSON.success) {
                    createCloseModalFunction();
                    confirmOpenNewWorkOrder(responseJSON.workOrderId);
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Creating Work Order',
                        message: responseJSON.errorMessage
                    });
                }
            });
        }
        function toggleActiveMilestone(changeEvent) {
            const checkbox = changeEvent.currentTarget;
            const milestoneElement = checkbox.closest('.panel-block');
            if (milestoneElement !== null) {
                const isChecked = checkbox.checked;
                milestoneElement.classList.toggle('has-background-grey-lighter', !isChecked);
                const fieldsetElement = milestoneElement.querySelector('fieldset');
                fieldsetElement?.classList.toggle('is-hidden', !isChecked);
                if (isChecked) {
                    fieldsetElement?.removeAttribute('disabled');
                }
                else {
                    fieldsetElement?.setAttribute('disabled', 'disabled');
                }
            }
        }
        cityssm.openHtmlModal('contract-createWorkOrder', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('#workOrderCreate--contractId').value = contractId;
                modalElement.querySelector('#workOrderCreate--workOrderOpenDateString').value = cityssm.dateToString(new Date());
                const workOrderTypeSelectElement = modalElement.querySelector('#workOrderCreate--workOrderTypeId');
                const workOrderTypes = exports.workOrderTypes;
                if (workOrderTypes.length === 1) {
                    workOrderTypeSelectElement.innerHTML = '';
                }
                for (const workOrderType of workOrderTypes) {
                    const optionElement = document.createElement('option');
                    optionElement.value = workOrderType.workOrderTypeId.toString();
                    optionElement.textContent = workOrderType.workOrderType ?? '';
                    workOrderTypeSelectElement.append(optionElement);
                }
                const workOrderMilestonesContainer = modalElement.querySelector('#workOrderCreateContainer--workOrderMilestones');
                if (exports.workOrderMilestoneTypes.length > 0) {
                    workOrderMilestonesContainer
                        .closest('.column')
                        ?.classList.remove('is-hidden');
                }
                for (const milestoneType of exports.workOrderMilestoneTypes) {
                    const milestoneElement = document.createElement('div');
                    milestoneElement.className =
                        'panel-block is-block has-background-grey-lighter';
                    milestoneElement.innerHTML = /* html */ `
              <div class="columns">
                <div class="column is-narrow">
                  <input
                    id="workOrderCreate--workOrderMilestoneId_${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}"
                    name="workOrderMilestoneId_${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}"
                    type="checkbox"
                    value="${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}"
                  />
                </div>
                <div class="column">
                  <p class="has-text-weight-bold mb-2">
                    <label for="workOrderCreate--workOrderMilestoneId_${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}">
                      ${cityssm.escapeHTML(milestoneType.workOrderMilestoneType)}
                    </label>
                  </p>
                  <fieldset class="is-hidden" disabled>
                    <div class="columns is-mobile mb-0">
                      <div class="column">
                        <div class="control">
                          <input
                            class="input is-small"
                            id="workOrderCreate--workOrderMilestoneDateString_${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}"
                            name="workOrderMilestoneDateString_${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}"
                            type="date"
                            value="${cityssm.escapeHTML(defaultMilestoneDateString)}"
                            placeholder="Milestone Date"
                            required
                          />
                        </div>
                      </div>
                      <div class="column">
                        <div class="control">
                          <input
                            class="input is-small"
                            id="workOrderCreate--workOrderMilestoneTimeString_${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}"
                            name="workOrderMilestoneTimeString_${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}"
                            type="time"
                            value=""
                            step="900"
                            placeholder="Milestone Time"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="control">
                      <textarea
                        class="textarea is-small"
                        id="workOrderCreate--workOrderMilestoneDescription_${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}"
                        name="workOrderMilestoneDescription_${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}"
                        placeholder="Milestone Description"
                        rows="2"
                      ></textarea>
                    </div>
                  </fieldset>
                </div>
              </div>
            `;
                    milestoneElement
                        .querySelector('input[type="checkbox"]')
                        ?.addEventListener('change', toggleActiveMilestone);
                    workOrderMilestonesContainer.append(milestoneElement);
                }
            },
            onshown(modalElement, closeModalFunction) {
                createCloseModalFunction = closeModalFunction;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#workOrderCreate--workOrderTypeId').focus();
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doCreate);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
                document.querySelector('#button--createWorkOrder').focus();
            }
        });
    });
})();

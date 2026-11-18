{
    const sunrise = exports.sunrise;
    const contractId = document.querySelector('#contract--contractId').value;
    function confirmOpenNewWorkOrder(workOrderId) {
        bulmaJS.confirm({
            contextualColorName: 'success',
            title: 'Work Order Created Successfully',
            message: 'Would you like to open the work order now?',
            okButton: {
                callbackFunction() {
                    globalThis.location.assign(sunrise.getWorkOrderUrl(workOrderId, true));
                },
                text: 'Yes, Open the Work Order'
            }
        });
    }
    const createWorkOrderButton = document.querySelector('#button--createWorkOrder');
    createWorkOrderButton?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        const workOrderTypes = JSON.parse(createWorkOrderButton.dataset.workOrderTypes ?? '[]');
        const workOrderStatuses = JSON.parse(createWorkOrderButton.dataset.workOrderStatuses ?? '[]');
        const workOrderMilestoneTypes = JSON.parse(createWorkOrderButton.dataset.workOrderMilestoneTypes ?? '[]');
        const workOrderWorkDayRanges = JSON.parse(createWorkOrderButton.dataset.workOrderWorkDayRanges ?? '{}');
        const workOrderStatHolidayDateStrings = new Set(JSON.parse(createWorkOrderButton.dataset.workOrderStatHolidayDates ?? '[]'));
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
                createCloseModalFunction();
                confirmOpenNewWorkOrder(responseJSON.workOrderId);
            });
        }
        function toggleActiveMilestone(changeEvent) {
            const checkbox = changeEvent.currentTarget;
            const milestoneElement = checkbox.closest('.panel-block');
            if (milestoneElement === null) {
                return;
            }
            const isChecked = checkbox.checked;
            milestoneElement.classList.toggle('has-background-grey-lighter', !isChecked);
            const fieldsetElement = milestoneElement.querySelector('fieldset');
            fieldsetElement?.classList.toggle('is-hidden', !isChecked);
            fieldsetElement?.toggleAttribute('disabled', !isChecked);
        }
        function refreshMilestoneDateTimeMessage(milestoneTypeId) {
            const dateElement = document.querySelector(`#workOrderCreate--workOrderMilestoneDateString_${milestoneTypeId}`);
            const timeElement = document.querySelector(`#workOrderCreate--workOrderMilestoneTimeString_${milestoneTypeId}`);
            const messageElement = document.querySelector(`#workOrderCreate--workOrderMilestoneDateTimeMessage_${milestoneTypeId}`);
            if (dateElement.value === '') {
                messageElement.textContent = '';
                return;
            }
            const dateValue = new Date(`${dateElement.value}T00:00:00`);
            const timeRange = workOrderWorkDayRanges[dateValue.getDay()] === undefined
                ? { endHour: 24, startHour: 0 }
                : workOrderWorkDayRanges[dateValue.getDay()];
            const setHourString = timeElement.value;
            const setHour = setHourString === ''
                ? -1
                : Math.trunc(Number(setHourString.split(':', 1)[0]));
            const hasWorkDayWarning = timeRange.startHour === -1 ||
                (setHour !== -1 && setHour < timeRange.startHour) ||
                timeRange.endHour === -1 ||
                (setHour !== -1 && setHour >= timeRange.endHour);
            const warningMessages = [];
            if (hasWorkDayWarning) {
                warningMessages.push('Milestone time is outside of regular work hours.');
            }
            if (workOrderStatHolidayDateStrings.has(dateElement.value)) {
                warningMessages.push('Milestone date falls on a configured stat holiday.');
            }
            messageElement.textContent = warningMessages.join(' ');
        }
        cityssm.openHtmlModal('contract-createWorkOrder', {
            onshow(modalElement) {
                const serviceDateElement = modalElement.querySelector('#workOrderCreate--serviceDate');
                const serviceDate = document.querySelector('#contract--funeralDateString').value;
                serviceDateElement.textContent =
                    serviceDate === '' ? '' : `Service Date: ${serviceDate}`;
                serviceDateElement.classList.toggle('is-hidden', serviceDate === '');
                const contractServiceTypesContainer = document.querySelector('#container--contractServiceTypes');
                const contractServiceTypes = JSON.parse(contractServiceTypesContainer?.dataset.contractServiceTypes ?? '[]');
                const contractServiceTypeNames = new Set(contractServiceTypes.map((serviceType) => serviceType.serviceType));
                modalElement.querySelector('#workOrderCreate--contractId').value = contractId;
                modalElement.querySelector('#workOrderCreate--workOrderOpenDateString').value = cityssm.dateToString(new Date());
                const workOrderTypeSelectElement = modalElement.querySelector('#workOrderCreate--workOrderTypeId');
                if (workOrderTypes.length > 0) {
                    workOrderTypeSelectElement.replaceChildren();
                    for (const workOrderType of workOrderTypes) {
                        const optionElement = document.createElement('option');
                        optionElement.value = workOrderType.workOrderTypeId.toString();
                        optionElement.textContent = workOrderType.workOrderType;
                        workOrderTypeSelectElement.append(optionElement);
                    }
                    workOrderTypeSelectElement.value =
                        workOrderTypes[0].workOrderTypeId.toString();
                }
                const workOrderStatusSelectElement = modalElement.querySelector('#workOrderCreate--workOrderStatusId');
                if (workOrderStatuses.length > 0) {
                    workOrderStatusSelectElement.replaceChildren();
                    for (const workOrderStatus of workOrderStatuses) {
                        const optionElement = document.createElement('option');
                        optionElement.value = workOrderStatus.workOrderStatusId.toString();
                        optionElement.textContent = workOrderStatus.workOrderStatus;
                        workOrderStatusSelectElement.append(optionElement);
                    }
                    workOrderStatusSelectElement.value =
                        workOrderStatuses[0].workOrderStatusId.toString();
                }
                const workOrderMilestonesContainer = modalElement.querySelector('#workOrderCreateContainer--workOrderMilestones');
                workOrderMilestonesContainer
                    .querySelectorAll('[data-work-order-milestone-create]')
                    .forEach((milestoneElement) => {
                    milestoneElement.remove();
                });
                if (workOrderMilestoneTypes.length > 0) {
                    workOrderMilestonesContainer
                        .closest('.column')
                        ?.classList.remove('is-hidden');
                }
                for (const milestoneType of workOrderMilestoneTypes) {
                    const milestoneElement = document.createElement('div');
                    const isContractServiceType = contractServiceTypeNames.has(milestoneType.workOrderMilestoneType);
                    milestoneElement.className = isContractServiceType
                        ? 'panel-block is-block'
                        : 'panel-block is-block has-background-grey-lighter';
                    milestoneElement.dataset.workOrderMilestoneCreate = 'true';
                    milestoneElement.innerHTML = `
            <div class="columns">
              <div class="column is-narrow">
                <input
                  id="workOrderCreate--workOrderMilestoneId_${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}"
                  name="workOrderMilestoneId_${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}"
                  type="checkbox"
                  value="${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}"
                  ${isContractServiceType ? 'checked' : ''}
                />
              </div>
              <div class="column">
                <p class="has-text-weight-bold mb-2">
                  <label for="workOrderCreate--workOrderMilestoneId_${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}">
                    ${cityssm.escapeHTML(milestoneType.workOrderMilestoneType)}
                  </label>
                </p>
                <fieldset class="${isContractServiceType ? '' : 'is-hidden'}" ${isContractServiceType ? '' : 'disabled'}>
                  <div class="columns is-mobile mb-0">
                    <div class="column">
                      <div class="control">
                        <input
                          class="input is-small"
                          id="workOrderCreate--workOrderMilestoneDateString_${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}"
                          name="workOrderMilestoneDateString_${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}"
                          type="date"
                          value="${cityssm.escapeHTML(defaultMilestoneDateString)}"
                          title="Milestone Date"
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
                          title="Milestone Time"
                        />
                      </div>
                    </div>
                  </div>
                  <p
                    class="has-text-warning-dark is-size-7"
                    id="workOrderCreate--workOrderMilestoneDateTimeMessage_${cityssm.escapeHTML(milestoneType.workOrderMilestoneTypeId.toString())}"
                  ></p>
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
                    milestoneElement
                        .querySelector(`#workOrderCreate--workOrderMilestoneDateString_${milestoneType.workOrderMilestoneTypeId}`)
                        ?.addEventListener('change', () => {
                        refreshMilestoneDateTimeMessage(milestoneType.workOrderMilestoneTypeId);
                    });
                    milestoneElement
                        .querySelector(`#workOrderCreate--workOrderMilestoneTimeString_${milestoneType.workOrderMilestoneTypeId}`)
                        ?.addEventListener('change', () => {
                        refreshMilestoneDateTimeMessage(milestoneType.workOrderMilestoneTypeId);
                    });
                    workOrderMilestonesContainer.append(milestoneElement);
                    refreshMilestoneDateTimeMessage(milestoneType.workOrderMilestoneTypeId);
                }
            },
            onshown(modalElement, closeModalFunction) {
                createCloseModalFunction = closeModalFunction;
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#workOrderCreate--workOrderTypeId').focus();
                modalElement.querySelector('form')?.addEventListener('submit', doCreate);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
                document.querySelector('#button--createWorkOrder').focus();
            }
        });
    });
}

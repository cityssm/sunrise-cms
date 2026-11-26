{
    const { sunrise } = exports;
    const canUpdateWorkOrders = document.querySelector('main')?.dataset.canUpdateWorkOrders === 'true';
    let currentDateString = cityssm.dateToString(new Date());
    let workdayDate = cityssm.dateStringToDate(exports.workdayDateString);
    const cemeteryFilterElement = document.querySelector('#filter--cemeteryId');
    const workdayContainer = document.querySelector('#container--workday');
    let incompleteMilestoneDays;
    function toggleWorkOrderMilestoneCompletion(clickEvent) {
        const toggleButtonElement = clickEvent.currentTarget;
        const workOrderMilestoneId = Math.trunc(Number(toggleButtonElement.dataset.workOrderMilestoneId ?? ''));
        const isMilestoneCompleted = toggleButtonElement.ariaChecked === 'true';
        function doToggleMilestone() {
            const workdayDateString = cityssm.dateToString(workdayDate);
            cityssm.postJSON(`${sunrise.urlPrefix}/workOrders/${isMilestoneCompleted ? 'doReopenWorkdayWorkOrderMilestone' : 'doCompleteWorkdayWorkOrderMilestone'}`, {
                workdayDateString,
                workOrderMilestoneId
            }, (responseJSON) => {
                if (responseJSON.success) {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Work Order Milestone updated successfully.'
                    });
                    renderWorkOrders(workdayDateString, responseJSON.workOrders);
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Milestone',
                        message: 'Please try again.'
                    });
                }
            });
        }
        if (isMilestoneCompleted) {
            bulmaJS.confirm({
                contextualColorName: 'warning',
                title: 'Reopen Work Order Milestone',
                message: 'Are you sure you want to reopen this milestone?',
                okButton: {
                    text: 'Yes, Reopen this Milestone',
                    callbackFunction: doToggleMilestone
                }
            });
        }
        else {
            bulmaJS.confirm({
                contextualColorName: 'info',
                title: 'Complete Work Order Milestone',
                message: 'Are you sure you want to complete this milestone?',
                okButton: {
                    text: 'Yes, Complete this Milestone',
                    callbackFunction: doToggleMilestone
                }
            });
        }
    }
    function updateMilestoneTime(clickEvent) {
        const buttonElement = clickEvent.currentTarget;
        const workOrderMilestoneId = Math.trunc(Number(buttonElement.dataset.workOrderMilestoneId ?? ''));
        const workOrderMilestoneTimeString = buttonElement.dataset.workOrderMilestoneTimeString ?? '';
        let closeModalFunction;
        function doUpdateTime(submitEvent) {
            submitEvent.preventDefault();
            const formElement = submitEvent.currentTarget;
            cityssm.postJSON(`${sunrise.urlPrefix}/workOrders/doUpdateWorkdayWorkOrderMilestoneTime`, formElement, (responseJSON) => {
                if (responseJSON.success) {
                    closeModalFunction?.();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Work Order Milestone Time updated successfully.'
                    });
                    renderWorkOrders(cityssm.dateToString(workdayDate), responseJSON.workOrders);
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Milestone Time',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('workOrderWorkday-editMilestoneTime', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('#workOrderMilestoneUpdate--workdayDateString').value = cityssm.dateToString(workdayDate);
                modalElement.querySelector('#workOrderMilestoneUpdate--workOrderMilestoneId').value = workOrderMilestoneId.toString();
                modalElement.querySelector('#workOrderMilestoneUpdate--workOrderMilestoneDateString').value = cityssm.dateToString(workdayDate);
                modalElement.querySelector('#workOrderMilestoneUpdate--workOrderMilestoneTimeString').value = workOrderMilestoneTimeString;
                const milestoneDateString = cityssm.dateToString(workdayDate);
                const pastDateMessageElement = modalElement.querySelector('#workOrderMilestoneUpdate--pastDateMessage');
                pastDateMessageElement.classList.toggle('is-hidden', milestoneDateString >= cityssm.dateToString(new Date()));
            },
            onshown(modalElement, _closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                closeModalFunction = _closeModalFunction;
                modalElement
                    .querySelector('#workOrderMilestoneUpdate--setToday')
                    ?.addEventListener('click', () => {
                    const dateElement = modalElement.querySelector('#workOrderMilestoneUpdate--workOrderMilestoneDateString');
                    dateElement.value = cityssm.dateToString(new Date());
                    dateElement.removeAttribute('readonly');
                    modalElement
                        .querySelector('#workOrderMilestoneUpdate--pastDateMessage')
                        ?.classList.add('is-hidden');
                });
                modalElement
                    .querySelector('.is-unlock-button')
                    ?.addEventListener('click', (event) => {
                    event.preventDefault();
                    const dateElement = modalElement.querySelector('#workOrderMilestoneUpdate--workOrderMilestoneDateString');
                    dateElement.removeAttribute('readonly');
                    dateElement.focus();
                });
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateTime);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function closeWorkOrder(clickEvent) {
        const closeButtonElement = clickEvent.currentTarget;
        const workdayDateString = cityssm.dateToString(workdayDate);
        const workOrderId = Math.trunc(Number(closeButtonElement.dataset.workOrderId ?? ''));
        function doClose() {
            cityssm.postJSON(`${sunrise.urlPrefix}/workOrders/doCloseWorkdayWorkOrder`, {
                workdayDateString,
                workOrderId
            }, (responseJSON) => {
                if (responseJSON.success) {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Work Order closed successfully.'
                    });
                    renderWorkOrders(workdayDateString, responseJSON.workOrders);
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Closing Work Order',
                        message: 'Please try again.'
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Close Work Order',
            message: 'Are you sure you want to close this work order?',
            okButton: {
                text: 'Yes, Close this Work Order',
                callbackFunction: doClose
            }
        });
    }
    function buildBurialSiteHtml(burialSite) {
        return `
      <li>
        <span class="fa-li"><i class="fa-solid fa-map-pin"></i></span>
        <a href="${sunrise.urlPrefix}/burialSites/${burialSite.burialSiteId}" target="_blank">
          ${cityssm.escapeHTML(burialSite.burialSiteName ?? '')}
        </a><br />
        <span class="is-size-7">${cityssm.escapeHTML(burialSite.cemeteryName ?? '')}</span>
      </li>
    `;
    }
    function buildMilestoneElement(milestone, options) {
        const milestoneElement = document.createElement('div');
        milestoneElement.className = 'panel-block is-block';
        const isMilestoneCompleted = milestone.workOrderMilestoneCompletionDate !== null;
        if (!isMilestoneCompleted && options.highlightIncomplete === true) {
            milestoneElement.classList.add('has-background-warning-light');
        }
        const milestoneCheckIcon = isMilestoneCompleted
            ? 'fa-solid fa-check'
            : 'fa-regular fa-square';
        const milestoneCheckHtml = options.canUpdateThisWorkOrder
            ? `
        <button
          class="button button--toggle-milestone"
          data-work-order-milestone-id="${milestone.workOrderMilestoneId}"
          type="button"
          title="Toggle Milestone Completion"
          role="checkbox"
          aria-checked="${isMilestoneCompleted ? 'true' : 'false'}"
        >
          <span class="icon is-small">
            <i class="${milestoneCheckIcon}"></i>
          </span>
        </button>
      `
            : `
        <span class="icon is-small">
          <i class="${milestoneCheckIcon}"></i>
        </span>
      `;
        const milestoneTimeString = milestone.workOrderMilestoneTime === null
            ? 'Update Milestone Time'
            : milestone.workOrderMilestoneTimePeriodString;
        const milestoneTimeHtml = !isMilestoneCompleted && options.canUpdateThisWorkOrder
            ? `
          <button
            class="button button--edit-milestone-time"
            data-work-order-milestone-id="${milestone.workOrderMilestoneId}"
            data-work-order-milestone-time-string="${milestone.workOrderMilestoneTime === null ? '' : milestone.workOrderMilestoneTimeString}"
            type="button"
            title="Edit Milestone Time"
          >
            ${milestoneTimeString}
          </button>
        `
            : milestoneTimeString;
        milestoneElement.innerHTML = `
      <div class="columns is-mobile">
        <div class="column is-narrow">
          ${milestoneCheckHtml}
        </div>
        <div class="column">
          <div class="columns is-mobile mb-0">
            <div class="column">
              <strong>${cityssm.escapeHTML(milestone.workOrderMilestoneType ?? '')}</strong>
            </div>
            <div class="column is-narrow">
              ${milestoneTimeHtml}
            </div>
          </div>
          <p>${cityssm.escapeHTML(milestone.workOrderMilestoneDescription)}</p>
        </div>
      </div>
    `;
        if (options.canUpdateThisWorkOrder) {
            milestoneElement
                .querySelector('.button--toggle-milestone')
                ?.addEventListener('click', toggleWorkOrderMilestoneCompletion);
            milestoneElement
                .querySelector('.button--edit-milestone-time')
                ?.addEventListener('click', updateMilestoneTime);
        }
        return milestoneElement;
    }
    function renderContractsAndBurialSitesOnWorkOrder(workOrder, workOrderElement) {
        const usedBurialSiteIds = new Set();
        const contactContainerElement = workOrderElement.querySelector('.list--contacts');
        const burialSitesContainerElement = workOrderElement.querySelector('.list--burialSites');
        const workOrderContracts = workOrder.workOrderContracts ?? [];
        for (const contract of workOrderContracts) {
            if (contract.funeralDate !== null) {
                workOrderElement.insertAdjacentHTML('beforeend', `
            <div class="panel-block is-block">
              <div class="columns is-mobile">
                <div class="column is-narrow">
                  <span class="icon"><i class="fa-solid fa-place-of-worship"></i></span>
                </div>
                <div class="column">
                  <div class="columns is-mobile mb-0">
                    <div class="column">
                      ${contract.funeralHomeId === null
                    ? '(No Funeral Home)'
                    : `
                            <a href="${sunrise.getFuneralHomeUrl(contract.funeralHomeId)}" target="_blank">
                              ${cityssm.escapeHTML(contract.funeralHomeName ?? '')}
                            </a>
                          `}

                    </div>
                    <div class="column is-narrow">
                      ${cityssm.escapeHTML(contract.funeralDateString ?? '')}
                      ${cityssm.escapeHTML(contract.funeralTimePeriodString ?? '')}
                    </div>
                  </div>
                  <div class="columns">
                    <div class="column">
                      <strong>Direction of Arrival</strong><br />
                      ${cityssm.escapeHTML(contract.directionOfArrival ?? '')}
                    </div>
                    <div class="column">
                      <strong>Committal Type</strong><br />
                      ${cityssm.escapeHTML(contract.committalType ?? '')}
                    </div>
                    <div class="column">
                      <strong>Funeral Director</strong><br />
                      ${cityssm.escapeHTML(contract.funeralDirectorName)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `);
            }
            const contractInterments = contract.contractInterments ?? [];
            for (const interment of contractInterments) {
                contactContainerElement.insertAdjacentHTML('beforeend', `
            <li>
              <span class="fa-li"><i class="fa-solid fa-user"></i></span>
              ${cityssm.escapeHTML(interment.deceasedName)}<br />
              <a class="is-size-7" href="${sunrise.getContractUrl(contract.contractId)}" target="_blank">
                Contract #${cityssm.escapeHTML(contract.contractNumber)}
              </a>
            </li>
          `);
            }
            if (contract.burialSiteId !== undefined &&
                contract.burialSiteId !== null &&
                !usedBurialSiteIds.has(contract.burialSiteId)) {
                usedBurialSiteIds.add(contract.burialSiteId);
                burialSitesContainerElement.insertAdjacentHTML('beforeend', buildBurialSiteHtml(contract));
            }
        }
        const workOrderBurialSites = workOrder.workOrderBurialSites ?? [];
        for (const burialSite of workOrderBurialSites) {
            if (usedBurialSiteIds.has(burialSite.burialSiteId)) {
                continue;
            }
            burialSitesContainerElement.insertAdjacentHTML('beforeend', buildBurialSiteHtml(burialSite));
        }
    }
    function renderMilestonesOnWorkOrder(workOrder, workOrderElement, options) {
        const workdayDateString = cityssm.dateToString(workdayDate);
        let includesMilestones = false;
        let includesIncompleteMilestones = false;
        const workOrderMilestones = workOrder.workOrderMilestones ?? [];
        for (const milestone of workOrderMilestones) {
            if (milestone.workOrderMilestoneCompletionDate === null) {
                includesIncompleteMilestones = true;
            }
            if (milestone.workOrderMilestoneDateString !== workdayDateString) {
                continue;
            }
            includesMilestones = true;
            const milestoneElement = buildMilestoneElement(milestone, {
                ...options,
                highlightIncomplete: workdayDateString < cityssm.dateToString(new Date())
            });
            workOrderElement.append(milestoneElement);
        }
        if (!includesMilestones) {
            workOrderElement.insertAdjacentHTML('beforeend', `
          <div class="panel-block is-block">
            <p class="has-text-grey">No individual milestones for this work order.</p>
          </div>
        `);
        }
        if (!includesIncompleteMilestones && options.canUpdateThisWorkOrder) {
            workOrderElement
                .querySelector(':scope .panel-heading .level-right')
                ?.insertAdjacentHTML('beforeend', `
            <div class="level-item is-hidden-print">
              <button class="button is-small button--close-work-order"
                data-work-order-id="${cityssm.escapeHTML(workOrder.workOrderId.toString())}"
                type="button">
                <span class="icon is-small">
                  <i class="fa-solid fa-stop-circle"></i>
                </span>
                <span>Close Work Order</span>
              </button>
            </div>
          `);
            workOrderElement
                .querySelector('.button--close-work-order')
                ?.addEventListener('click', closeWorkOrder);
        }
    }
    function renderWorkOrders(workdayDateString, workOrders) {
        workdayContainer.replaceChildren();
        currentDateString = cityssm.dateToString(new Date());
        for (const workOrder of workOrders) {
            const isWorkOrderClosed = workOrder.workOrderCloseDate !== null;
            const canUpdateThisWorkOrder = !isWorkOrderClosed &&
                canUpdateWorkOrders &&
                cityssm.dateToString(workdayDate) <= currentDateString;
            const workOrderElement = document.createElement('div');
            workOrderElement.className = 'panel avoid-page-break';
            let progressTagClassName = '';
            if (workOrder.workOrderMilestoneCompletionCount ===
                workOrder.workOrderMilestoneCount) {
                progressTagClassName = 'is-success';
            }
            else if ((workOrder.workOrderMilestoneOverdueCount ?? 0) > 0) {
                progressTagClassName = 'is-warning';
            }
            workOrderElement.innerHTML = `
        <div class="panel-heading p-3">
          <div class="level is-mobile">
            <div class="level-left">
              <div class="level-item">
                <h2>
                  <a
                    class="has-text-white"
                    href="${sunrise.getWorkOrderUrl(workOrder.workOrderId, canUpdateThisWorkOrder)}"
                    title="Open Work Order #${cityssm.escapeHTML(workOrder.workOrderNumber ?? '')}"
                    target="_blank"
                  >
                    #${cityssm.escapeHTML(workOrder.workOrderNumber ?? '')}
                  </a>
                  ${isWorkOrderClosed
                ? `
                        <span class="tag is-info">
                          <span class="icon is-small"><i class="fa-solid fa-stop"></i></span>
                          <span>Closed</span>
                        </span>
                      `
                : ''}
                </h2>
              </div>
            </div>
            <div class="level-right">
              <div class="level-item">
                <div class="tags has-addons">
                  <span class="tag is-dark">Progress</span>
                  <span class="tag ${progressTagClassName}">
                    ${workOrder.workOrderMilestoneCompletionCount ?? 0} / ${workOrder.workOrderMilestoneCount ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="panel-block is-block">
          <p>${cityssm.escapeHTML((workOrder.workOrderDescription ?? '') === '' ? (workOrder.workOrderType ?? '') : (workOrder.workOrderDescription ?? ''))}</p>
          ${(workOrder.workOrderContracts ?? []).length > 0 ||
                (workOrder.workOrderBurialSites ?? []).length > 0
                ? `
                <div class="columns">
                  <div class="column">
                    <ul class="fa-ul list--contacts"></ul>
                  </div>
                  <div class="column column--burialSites">
                    <ul class="fa-ul list--burialSites"></ul>
                  </div>
                </div>
              `
                : ''}
        </div>
      `;
            renderContractsAndBurialSitesOnWorkOrder(workOrder, workOrderElement);
            renderMilestonesOnWorkOrder(workOrder, workOrderElement, {
                canUpdateThisWorkOrder,
                workdayDateString
            });
            workdayContainer.append(workOrderElement);
        }
        if (workOrders.length === 0) {
            workdayContainer.insertAdjacentHTML('beforeend', `
          <div class="message is-info">
            <p class="message-body">No work orders for this workday.</p>
          </div>
        `);
        }
    }
    function selectIncompleteMilestoneDay(workdayDateString, closeModalFunction) {
        workdayDate = cityssm.dateStringToDate(workdayDateString);
        updateFiltersAndGetReport();
        closeModalFunction();
    }
    function openIncompleteMilestoneModal() {
        let closeModalFunction;
        cityssm.openHtmlModal('workOrderWorkday-incompleteMilestones', {
            onshow(modalElement) {
                const listElement = modalElement.querySelector('#list--incompleteMilestoneDays');
                listElement.replaceChildren();
                const days = incompleteMilestoneDays ?? [];
                for (const day of days) {
                    const listItemElement = document.createElement('li');
                    const buttonElement = document.createElement('button');
                    buttonElement.className = 'button is-white is-fullwidth';
                    buttonElement.type = 'button';
                    buttonElement.textContent = `${day.workdayDateString} — ${day.incompleteMilestoneCount} incomplete`;
                    buttonElement.addEventListener('click', () => {
                        if (closeModalFunction !== undefined) {
                            selectIncompleteMilestoneDay(day.workdayDateString, closeModalFunction);
                        }
                    });
                    listItemElement.append(buttonElement);
                    listElement.append(listItemElement);
                }
            },
            onshown(_modalElement, _closeModalFunction) {
                closeModalFunction = _closeModalFunction;
            }
        });
    }
    function getWorkdayReport() {
        workdayContainer.innerHTML = sunrise.getLoadingParagraphHtml('Loading workday report...');
        const workdayDateString = cityssm.dateToString(workdayDate);
        cityssm.postJSON(`${sunrise.urlPrefix}/workOrders/doGetWorkdayReport`, {
            cemeteryId: cemeteryFilterElement.value,
            workdayDateString
        }, (responseJSON) => {
            incompleteMilestoneDays = responseJSON.incompleteMilestoneDays;
            const containerElement = document.querySelector('#container--incompleteMilestones');
            const countElement = document.querySelector('#span--incompleteMilestoneCount');
            const incompleteCount = incompleteMilestoneDays.reduce((sum, day) => sum + day.incompleteMilestoneCount, 0);
            containerElement.classList.toggle('is-hidden', incompleteCount === 0);
            countElement.textContent = `${incompleteCount} incomplete past milestone${incompleteCount === 1 ? '' : 's'}`;
            renderWorkOrders(workdayDateString, responseJSON.workOrders);
        });
    }
    function updateFiltersAndGetReport() {
        ;
        document.querySelector('#workdayDateStringSpan').textContent = cityssm.dateToString(workdayDate);
        document
            .querySelector('#button--workdayToday')
            ?.classList.toggle('is-hidden', workdayDate.toDateString() === new Date().toDateString());
        getWorkdayReport();
    }
    document
        .querySelector('#button--workdayToday')
        ?.addEventListener('click', () => {
        workdayDate = new Date();
        updateFiltersAndGetReport();
    });
    document
        .querySelector('#button--workdayPreviousDay')
        ?.addEventListener('click', () => {
        workdayDate.setDate(workdayDate.getDate() - 1);
        updateFiltersAndGetReport();
    });
    document
        .querySelector('#button--workdayNextDay')
        ?.addEventListener('click', () => {
        workdayDate.setDate(workdayDate.getDate() + 1);
        updateFiltersAndGetReport();
    });
    cemeteryFilterElement.addEventListener('change', updateFiltersAndGetReport);
    document
        .querySelector('#button--incompleteMilestones')
        ?.addEventListener('click', openIncompleteMilestoneModal);
    updateFiltersAndGetReport();
    document
        .querySelector('aside.menu')
        ?.closest('.column')
        ?.classList.add('is-hidden-mobile');
}

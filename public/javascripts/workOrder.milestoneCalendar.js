"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const workOrderSearchFiltersFormElement = document.querySelector('#form--searchFilters');
    const workOrderMilestoneDateFilterElement = workOrderSearchFiltersFormElement.querySelector('#searchFilter--workOrderMilestoneDateFilter');
    const workOrderMilestoneDateStringElement = workOrderSearchFiltersFormElement.querySelector('#searchFilter--workOrderMilestoneDateString');
    const milestoneCalendarContainerElement = document.querySelector('#container--milestoneCalendar');
    // eslint-disable-next-line complexity
    function renderMilestones(workOrderMilestones) {
        if (workOrderMilestones.length === 0) {
            milestoneCalendarContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no milestones that meet the search criteria.</p>
        </div>`;
            return;
        }
        milestoneCalendarContainerElement.innerHTML = '';
        const currentDate = cityssm.dateToString(new Date());
        let currentPanelElement;
        let currentPanelDateString = 'x';
        for (const milestone of workOrderMilestones) {
            if (currentPanelDateString !== milestone.workOrderMilestoneDateString) {
                if (currentPanelElement) {
                    milestoneCalendarContainerElement.append(currentPanelElement);
                }
                currentPanelElement = document.createElement('div');
                currentPanelElement.className = 'panel';
                currentPanelElement.innerHTML = `<h2 class="panel-heading">
          ${cityssm.escapeHTML(milestone.workOrderMilestoneDate === 0
                    ? 'No Set Date'
                    : milestone.workOrderMilestoneDateString ?? '')}
          </h2>`;
                currentPanelDateString = milestone.workOrderMilestoneDateString ?? '';
            }
            const panelBlockElement = document.createElement('div');
            panelBlockElement.className = 'panel-block is-block';
            if (!milestone.workOrderMilestoneCompletionDate &&
                milestone.workOrderMilestoneDateString !== '' &&
                milestone.workOrderMilestoneDateString < currentDate) {
                panelBlockElement.classList.add('has-background-warning-light');
            }
            let contractHTML = '';
            for (const burialSite of milestone.workOrderBurialSites ?? []) {
                contractHTML += `<li class="has-tooltip-left"
          data-tooltip="${cityssm.escapeHTML(burialSite.cemeteryName ?? '')}">
          <span class="fa-li">
          <i class="fa-solid fa-map-pin"
            aria-label="Burial Site"></i>
          </span>
          ${cityssm.escapeHTML(burialSite.burialSiteName ?? '')}
          </li>`;
            }
            for (const contract of milestone.workOrderContracts ?? []) {
                for (const interment of contract.contractInterments ?? []) {
                    contractHTML += `<li class="has-tooltip-left"
            data-tooltip="Interment">
            <span class="fa-li">
            <i class="fa-solid fa-user"
              aria-label="Interment"></i>
            </span>
            ${cityssm.escapeHTML(interment.deceasedName ?? '')}
            </li>`;
                }
            }
            // eslint-disable-next-line no-unsanitized/property
            panelBlockElement.innerHTML = `<div class="columns">
        <div class="column is-narrow">
          <span class="icon is-small">
            ${milestone.workOrderMilestoneCompletionDate
                ? '<i class="fa-solid fa-check" aria-label="Completed"></i>'
                : '<i class="fa-regular fa-square has-text-grey" aria-label="Incomplete"></i>'}
          </span>
        </div><div class="column">
          ${milestone.workOrderMilestoneTime === 0
                ? ''
                : `${milestone.workOrderMilestoneTimePeriodString}<br />`}
          ${milestone.workOrderMilestoneTypeId
                ? `<strong>${cityssm.escapeHTML(milestone.workOrderMilestoneType ?? '')}</strong><br />`
                : ''}
          <span class="is-size-7">
            ${cityssm.escapeHTML(milestone.workOrderMilestoneDescription ?? '')}
          </span>
        </div><div class="column">
          <i class="fa-solid fa-circle" style="color:${sunrise.getRandomColor(milestone.workOrderNumber ?? '')}"></i>
          <a class="has-text-weight-bold" href="${sunrise.getWorkOrderURL(milestone.workOrderId)}">
            ${cityssm.escapeHTML(milestone.workOrderNumber ?? '')}
          </a><br />
          <span class="is-size-7">${cityssm.escapeHTML(milestone.workOrderDescription ?? '')}</span>
        </div><div class="column is-size-7">
          ${contractHTML === ''
                ? ''
                : `<ul class="fa-ul ml-4">${contractHTML}</ul>`}</div></div>`;
            currentPanelElement.append(panelBlockElement);
        }
        milestoneCalendarContainerElement.append(currentPanelElement);
    }
    function getMilestones(event) {
        if (event) {
            event.preventDefault();
        }
        // eslint-disable-next-line no-unsanitized/property
        milestoneCalendarContainerElement.innerHTML =
            sunrise.getLoadingParagraphHTML('Loading Milestones...');
        cityssm.postJSON(`${sunrise.urlPrefix}/workOrders/doGetWorkOrderMilestones`, workOrderSearchFiltersFormElement, (responseJSON) => {
            renderMilestones(responseJSON.workOrderMilestones);
        });
    }
    workOrderMilestoneDateFilterElement.addEventListener('change', () => {
        ;
        workOrderMilestoneDateStringElement.closest('fieldset').disabled = workOrderMilestoneDateFilterElement.value !== 'date';
        getMilestones();
    });
    workOrderMilestoneDateStringElement.addEventListener('change', getMilestones);
    workOrderSearchFiltersFormElement.addEventListener('submit', getMilestones);
    getMilestones();
})();

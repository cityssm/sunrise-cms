"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const workOrderPrints = exports.workOrderPrints;
    const searchFilterFormElement = document.querySelector('#form--searchFilters');
    const searchResultsContainerElement = document.querySelector('#container--searchResults');
    const limitElement = document.querySelector('#searchFilter--limit');
    const offsetElement = document.querySelector('#searchFilter--offset');
    const hasWorkOrderTypeFilter = document.querySelector('#searchFilter--workOrderTypeId') !== null;
    function buildRelatedLiHTML(workOrder) {
        let relatedHTML = '';
        for (const burialSite of workOrder.workOrderBurialSites ?? []) {
            relatedHTML += `<li class="has-tooltip-left"
          data-tooltip="${cityssm.escapeHTML(burialSite.cemeteryName ?? '')}">
          <span class="fa-li">
            <i class="fa-solid fa-map-pin"
              aria-label="Burial Site"></i>
          </span>
          ${cityssm.escapeHTML(burialSite.burialSiteName === ''
                ? '(No Burial Site Name)'
                : burialSite.burialSiteName)}
        </li>`;
        }
        for (const contract of workOrder.workOrderContracts ?? []) {
            for (const interment of contract.contractInterments ?? []) {
                relatedHTML += `<li class="has-tooltip-left"
            data-tooltip="${cityssm.escapeHTML(contract.isPreneed ? 'Recipient' : 'Deceased')}">
            <span class="fa-li">
              <i class="fa-solid fa-user"></i>
            </span>
            ${cityssm.escapeHTML(interment.deceasedName ?? '')}
          </li>`;
            }
            if (contract.funeralHomeName !== null) {
                relatedHTML += `<li class="has-tooltip-left" data-tooltip="Funeral Home">
            <span class="fa-li">
              <i class="fa-solid fa-place-of-worship"></i>
            </span>
            ${cityssm.escapeHTML(contract.funeralHomeName)}
          </li>`;
            }
        }
        if (relatedHTML !== '') {
            relatedHTML = `<ul class="fa-ul ml-5 is-size-7">${relatedHTML}</ul>`;
        }
        return relatedHTML;
    }
    function renderWorkOrders(rawResponseJSON) {
        const responseJSON = rawResponseJSON;
        if (responseJSON.workOrders.length === 0) {
            searchResultsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no work orders that meet the search criteria.</p>
        </div>`;
            return;
        }
        const resultsTbodyElement = document.createElement('tbody');
        for (const workOrder of responseJSON.workOrders) {
            const relatedHTML = buildRelatedLiHTML(workOrder);
            // eslint-disable-next-line no-unsanitized/method
            resultsTbodyElement.insertAdjacentHTML('beforeend', `<tr class="avoid-page-break ${(workOrder.workOrderMilestoneOverdueCount ?? 0) > 0 ? 'has-background-warning-light' : ''}">
          <td>
            <a class="has-text-weight-bold" href="${sunrise.getWorkOrderUrl(workOrder.workOrderId)}">
              ${workOrder.workOrderNumber?.trim() === ''
                ? '(No Number)'
                : cityssm.escapeHTML(workOrder.workOrderNumber ?? '')}
            </a>
          </td><td>
            ${hasWorkOrderTypeFilter
                ? cityssm.escapeHTML(workOrder.workOrderType ?? '') + '<br />'
                : ''}
            <span class="is-size-7">
              ${cityssm.escapeHTML(workOrder.workOrderDescription ?? '')}
            </span>
          </td><td>
            ${relatedHTML}
          </td><td>
            <ul class="fa-ul ml-5 is-size-7">
              <li class="has-tooltip-left"
                data-tooltip="${sunrise.escapedAliases.WorkOrderOpenDate}">
                <span class="fa-li">
                  <i class="fa-solid fa-play" aria-label="${sunrise.escapedAliases.WorkOrderOpenDate}"></i>
                </span>
                ${workOrder.workOrderOpenDateString}
              </li>
              <li class="has-tooltip-left" data-tooltip="${sunrise.escapedAliases.WorkOrderCloseDate}">
                <span class="fa-li">
                  <i class="fa-solid fa-stop" aria-label="${sunrise.escapedAliases.WorkOrderCloseDate}"></i>
                </span>
                ${workOrder.workOrderCloseDate
                ? workOrder.workOrderCloseDateString
                : `<span class="has-text-grey">(No ${sunrise.escapedAliases.WorkOrderCloseDate})</span>`}
              </li>
            </ul>
          </td><td>
            ${workOrder.workOrderMilestoneCount === 0
                ? '-'
                : `${(workOrder.workOrderMilestoneCompletionCount ?? '').toString()}
                  /
                  ${(workOrder.workOrderMilestoneCount ?? '').toString()}`}
          </td>
          ${workOrderPrints.length > 0
                ? `<td>
                  <a class="button is-small" data-tooltip="Print"
                    href="${sunrise.urlPrefix}/print/${workOrderPrints[0]}/?workOrderId=${workOrder.workOrderId.toString()}"
                    target="_blank">
                    <span class="icon"><i class="fa-solid fa-print" aria-label="Print"></i></span>
                  </a>
                  </td>`
                : ''}</tr>`);
        }
        // eslint-disable-next-line no-unsanitized/property
        searchResultsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
      <thead><tr>
      <th>Work Order Number</th>
      <th>Description</th>
      <th>Related</th>
      <th>Date</th>
      <th class="has-tooltip-bottom" data-tooltip="Completed / Total Milestones">Progress</th>
      ${workOrderPrints.length > 0 ? '<th class="has-width-1"></th>' : ''}
      </tr></thead>
      <table>`;
        // eslint-disable-next-line no-unsanitized/method
        searchResultsContainerElement.insertAdjacentHTML('beforeend', sunrise.getSearchResultsPagerHTML(Number.parseInt(limitElement.value, 10), responseJSON.offset, responseJSON.count));
        searchResultsContainerElement
            .querySelector('table')
            ?.append(resultsTbodyElement);
        searchResultsContainerElement
            .querySelector("button[data-page='previous']")
            ?.addEventListener('click', previousAndGetWorkOrders);
        searchResultsContainerElement
            .querySelector("button[data-page='next']")
            ?.addEventListener('click', nextAndGetWorkOrders);
    }
    function getWorkOrders() {
        // eslint-disable-next-line no-unsanitized/property
        searchResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHTML('Loading Work Orders...');
        cityssm.postJSON(`${sunrise.urlPrefix}/workOrders/doSearchWorkOrders`, searchFilterFormElement, renderWorkOrders);
    }
    function resetOffsetAndGetWorkOrders() {
        offsetElement.value = '0';
        getWorkOrders();
    }
    function previousAndGetWorkOrders() {
        offsetElement.value = Math.max(Number.parseInt(offsetElement.value, 10) -
            Number.parseInt(limitElement.value, 10), 0).toString();
        getWorkOrders();
    }
    function nextAndGetWorkOrders() {
        offsetElement.value = (Number.parseInt(offsetElement.value, 10) +
            Number.parseInt(limitElement.value, 10)).toString();
        getWorkOrders();
    }
    const filterElements = searchFilterFormElement.querySelectorAll('input, select');
    for (const filterElement of filterElements) {
        filterElement.addEventListener('change', resetOffsetAndGetWorkOrders);
    }
    searchFilterFormElement.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
    });
    getWorkOrders();
})();

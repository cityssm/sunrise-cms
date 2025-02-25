import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { LOS } from '../../types/globalTypes.js'
import type { WorkOrder } from '../../types/recordTypes.js'

declare const cityssm: cityssmGlobal

declare const exports: Record<string, unknown>
;(() => {
  const los = exports.los as LOS

  const workOrderPrints = exports.workOrderPrints as string[]

  const searchFilterFormElement = document.querySelector(
    '#form--searchFilters'
  ) as HTMLFormElement

  los.initializeDatePickers(searchFilterFormElement)

  const searchResultsContainerElement = document.querySelector(
    '#container--searchResults'
  ) as HTMLElement

  const limit = Number.parseInt(
    (document.querySelector('#searchFilter--limit') as HTMLInputElement).value,
    10
  )

  const offsetElement = document.querySelector(
    '#searchFilter--offset'
  ) as HTMLInputElement

  function renderWorkOrders(rawResponseJSON: unknown): void {
    const responseJSON = rawResponseJSON as {
      count: number
      offset: number
      workOrders: WorkOrder[]
    }

    if (responseJSON.workOrders.length === 0) {
      searchResultsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no work orders that meet the search criteria.</p>
        </div>`

      return
    }

    const resultsTbodyElement = document.createElement('tbody')

    for (const workOrder of responseJSON.workOrders) {
      let relatedHTML = ''

      for (const lot of workOrder.workOrderLots ?? []) {
        relatedHTML += `<li class="has-tooltip-left"
          data-tooltip="${cityssm.escapeHTML(lot.cemeteryName ?? '')}">
          <span class="fa-li">
            <i class="fas fa-fw fa-vector-square"
              aria-label="${los.escapedAliases.Lot}"></i>
          </span>
          ${cityssm.escapeHTML(
            (lot.lotName ?? '') === ''
              ? `(No ${los.escapedAliases.Lot} Name)`
              : lot.lotName ?? ''
          )}
          </li>`
      }

      for (const occupancy of workOrder.workOrderBurialSiteContracts ?? []) {
        for (const occupant of occupancy.burialSiteContractOccupants ?? []) {
          relatedHTML += `<li class="has-tooltip-left"
            data-tooltip="${cityssm.escapeHTML(
              occupant.lotOccupantType ?? ''
            )}">
            <span class="fa-li">
              <i class="fas fa-fw fa-${cityssm.escapeHTML(
                (occupant.fontAwesomeIconClass ?? '') === ''
                  ? 'user'
                  : occupant.fontAwesomeIconClass ?? ''
              )}" aria-label="${los.escapedAliases.occupant}"></i>
            </span>
            ${cityssm.escapeHTML(
              (occupant.occupantName ?? '') === '' &&
                (occupant.occupantFamilyName ?? '') === ''
                ? '(No Name)'
                : `${occupant.occupantName} ${occupant.occupantFamilyName}`
            )}
            </li>`
        }
      }

      // eslint-disable-next-line no-unsanitized/method
      resultsTbodyElement.insertAdjacentHTML(
        'beforeend',
        `<tr>
          <td>
            <a class="has-text-weight-bold" href="${los.getWorkOrderURL(workOrder.workOrderId)}">
              ${
                workOrder.workOrderNumber?.trim() === ''
                  ? '(No Number)'
                  : cityssm.escapeHTML(workOrder.workOrderNumber ?? '')
              }
            </a>
          </td><td>
            ${cityssm.escapeHTML(workOrder.workOrderType ?? '')}<br />
            <span class="is-size-7">
              ${cityssm.escapeHTML(workOrder.workOrderDescription ?? '')}
            </span>
          </td><td>
            ${
              relatedHTML === ''
                ? ''
                : `<ul class="fa-ul ml-5 is-size-7">${relatedHTML}</ul>`
            }
          </td><td>
            <ul class="fa-ul ml-5 is-size-7">
              <li class="has-tooltip-left"
                data-tooltip="${los.escapedAliases.WorkOrderOpenDate}">
                <span class="fa-li">
                  <i class="fas fa-fw fa-play" aria-label="${los.escapedAliases.WorkOrderOpenDate}"></i>
                </span>
                ${workOrder.workOrderOpenDateString}
              </li>
              <li class="has-tooltip-left" data-tooltip="${los.escapedAliases.WorkOrderCloseDate}">
                <span class="fa-li">
                  <i class="fas fa-fw fa-stop" aria-label="${los.escapedAliases.WorkOrderCloseDate}"></i>
                </span>
                ${
                  workOrder.workOrderCloseDate
                    ? workOrder.workOrderCloseDateString
                    : `<span class="has-text-grey">(No ${los.escapedAliases.WorkOrderCloseDate})</span>`
                }
              </li>
            </ul>
          </td><td>
            ${
              workOrder.workOrderMilestoneCount === 0
                ? '-'
                : `${(
                    workOrder.workOrderMilestoneCompletionCount ?? ''
                  ).toString()}
                  /
                  ${(workOrder.workOrderMilestoneCount ?? '').toString()}`
            }
          </td>
          ${
            workOrderPrints.length > 0
              ? `<td>
                  <a class="button is-small" data-tooltip="Print"
                    href="${los.urlPrefix}/print/${workOrderPrints[0]}/?workOrderId=${workOrder.workOrderId.toString()}"
                    target="_blank">
                    <i class="fas fa-print" aria-label="Print"></i>
                  </a>
                  </td>`
              : ''
          }</tr>`
      )
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
      <table>`

    // eslint-disable-next-line no-unsanitized/method
    searchResultsContainerElement.insertAdjacentHTML(
      'beforeend',
      los.getSearchResultsPagerHTML(
        limit,
        responseJSON.offset,
        responseJSON.count
      )
    )

    searchResultsContainerElement
      .querySelector('table')
      ?.append(resultsTbodyElement)

    searchResultsContainerElement
      .querySelector("button[data-page='previous']")
      ?.addEventListener('click', previousAndGetWorkOrders)

    searchResultsContainerElement
      .querySelector("button[data-page='next']")
      ?.addEventListener('click', nextAndGetWorkOrders)
  }

  function getWorkOrders(): void {
    // eslint-disable-next-line no-unsanitized/property
    searchResultsContainerElement.innerHTML = los.getLoadingParagraphHTML(
      'Loading Work Orders...'
    )

    cityssm.postJSON(
      `${los.urlPrefix}/workOrders/doSearchWorkOrders`,
      searchFilterFormElement,
      renderWorkOrders
    )
  }

  function resetOffsetAndGetWorkOrders(): void {
    offsetElement.value = '0'
    getWorkOrders()
  }

  function previousAndGetWorkOrders(): void {
    offsetElement.value = Math.max(
      Number.parseInt(offsetElement.value, 10) - limit,
      0
    ).toString()
    getWorkOrders()
  }

  function nextAndGetWorkOrders(): void {
    offsetElement.value = (
      Number.parseInt(offsetElement.value, 10) + limit
    ).toString()
    getWorkOrders()
  }

  const filterElements =
    searchFilterFormElement.querySelectorAll('input, select')

  for (const filterElement of filterElements) {
    filterElement.addEventListener('change', resetOffsetAndGetWorkOrders)
  }

  searchFilterFormElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()
  })

  // eslint-disable-next-line no-secrets/no-secrets
  /*
    const workOrderOpenDateStringElement = document.querySelector("#searchFilter--workOrderOpenDateString") as HTMLInputElement;

    document.querySelector("#button--workOrderOpenDateString-previous").addEventListener("click", () => {

        if (workOrderOpenDateStringElement.value === "") {
            workOrderOpenDateStringElement.valueAsDate = new Date();
        } else {
            const openDate = workOrderOpenDateStringElement.valueAsDate;
            openDate.setDate(openDate.getDate() - 1);
            workOrderOpenDateStringElement.valueAsDate = openDate;
        }

        resetOffsetAndGetWorkOrders();
    });

    document.querySelector("#button--workOrderOpenDateString-next").addEventListener("click", () => {

        if (workOrderOpenDateStringElement.value === "") {
            workOrderOpenDateStringElement.valueAsDate = new Date();
        } else {
            const openDate = workOrderOpenDateStringElement.valueAsDate;
            openDate.setDate(openDate.getDate() + 1);
            workOrderOpenDateStringElement.valueAsDate = openDate;
        }

        resetOffsetAndGetWorkOrders();
    });
  */

  getWorkOrders()
})()

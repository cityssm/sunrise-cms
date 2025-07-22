import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { WorkOrder } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: Record<string, unknown>
;(() => {
  const sunrise = exports.sunrise as Sunrise

  const workOrderPrints = exports.workOrderPrints as string[]

  const searchFilterFormElement = document.querySelector(
    '#form--searchFilters'
  ) as HTMLFormElement

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

  // eslint-disable-next-line complexity
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

      for (const burialSite of workOrder.workOrderBurialSites ?? []) {
        relatedHTML += `<li class="has-tooltip-left"
          data-tooltip="${cityssm.escapeHTML(burialSite.cemeteryName ?? '')}">
          <span class="fa-li">
            <i class="fas fa-fw fa-map-pin"
              aria-label="Burial Site"></i>
          </span>
          ${cityssm.escapeHTML(
            (burialSite.burialSiteName ?? '') === ''
              ? '(No Burial Site Name)'
              : burialSite.burialSiteName ?? ''
          )}
          </li>`
      }

      for (const contract of workOrder.workOrderContracts ?? []) {
        for (const interment of contract.contractInterments ?? []) {
          relatedHTML += `<li class="has-tooltip-left"
            data-tooltip="${cityssm.escapeHTML(
              contract.isPreneed ? 'Recipient' : 'Deceased'
            )}">
            <span class="fa-li">
              <i class="fas fa-fw fa-user"></i>
            </span>
            ${cityssm.escapeHTML(interment.deceasedName ?? '')}
            </li>`
        }

        if (contract.funeralHomeName !== null) {
          relatedHTML += `<li class="has-tooltip-left"
            data-tooltip="Funeral Home">
            <span class="fa-li">
              <i class="fas fa-fw fa-place-of-worship"></i>
            </span>
            ${cityssm.escapeHTML(contract.funeralHomeName)}
            </li>`
        }
      }

      // eslint-disable-next-line no-unsanitized/method
      resultsTbodyElement.insertAdjacentHTML(
        'beforeend',
        `<tr class="avoid-page-break">
          <td>
            <a class="has-text-weight-bold" href="${sunrise.getWorkOrderURL(workOrder.workOrderId)}">
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
                data-tooltip="${sunrise.escapedAliases.WorkOrderOpenDate}">
                <span class="fa-li">
                  <i class="fas fa-fw fa-play" aria-label="${sunrise.escapedAliases.WorkOrderOpenDate}"></i>
                </span>
                ${workOrder.workOrderOpenDateString}
              </li>
              <li class="has-tooltip-left" data-tooltip="${sunrise.escapedAliases.WorkOrderCloseDate}">
                <span class="fa-li">
                  <i class="fas fa-fw fa-stop" aria-label="${sunrise.escapedAliases.WorkOrderCloseDate}"></i>
                </span>
                ${
                  workOrder.workOrderCloseDate
                    ? workOrder.workOrderCloseDateString
                    : `<span class="has-text-grey">(No ${sunrise.escapedAliases.WorkOrderCloseDate})</span>`
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
                    href="${sunrise.urlPrefix}/print/${workOrderPrints[0]}/?workOrderId=${workOrder.workOrderId.toString()}"
                    target="_blank">
                    <span class="icon"><i class="fas fa-print" aria-label="Print"></i></span>
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
      sunrise.getSearchResultsPagerHTML(
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
    searchResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHTML(
      'Loading Work Orders...'
    )

    cityssm.postJSON(
      `${sunrise.urlPrefix}/workOrders/doSearchWorkOrders`,
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

  getWorkOrders()
})()

import type { CityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoSearchOrderFormsResponse } from '../../handlers/contractsPost/doSearchOrderForms.js'
import type { OrderForm } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: CityssmGlobal

declare const exports: {
  sunrise: Sunrise
}
{
  const sunrise = exports.sunrise

  const searchFilterFormElement = document.querySelector(
    '#form--searchFilters'
  ) as HTMLFormElement

  const searchResultsContainerElement = document.querySelector(
    '#container--searchResults'
  ) as HTMLElement

  const limitElement = document.querySelector(
    '#searchFilter--limit'
  ) as HTMLSelectElement

  const offsetElement = document.querySelector(
    '#searchFilter--offset'
  ) as HTMLInputElement

  function buildOrderFormRowElement(orderForm: OrderForm): HTMLTableRowElement {
    const orderFormData = orderForm.orderFormData
    const purchaserName = orderFormData.purchaserName || '(No Purchaser)'
    const deceasedName =
      orderFormData.deceasedName ??
      (orderFormData.deceasedSameAsPurchaser === 'true' ? purchaserName : '') ||
      '(No Deceased Name)'
    const funeralHomeName = orderFormData.funeralHomeName || '(No Funeral Home)'
    const cemeteryName = orderFormData.cemeteryIdText || '(No Cemetery)'
    const burialSiteName = orderFormData.burialSiteName || '(No Burial Site)'

    const processedStatus = orderForm.isOrderFormProcessed === 1

    const resultRowElement = document.createElement('tr')
    resultRowElement.className = 'avoid-page-break'

    resultRowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td>#${cityssm.escapeHTML(orderForm.orderFormId.toString())}</td>
      `
    )

    resultRowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td>
          ${cityssm.escapeHTML(
            new Date(orderForm.recordCreate_timeMillis).toLocaleDateString()
          )}
        </td>
      `
    )

    resultRowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td>
          <strong>${cityssm.escapeHTML(deceasedName)}</strong><br />
          <span class="is-size-7">${cityssm.escapeHTML(purchaserName)}</span>
        </td>
      `
    )

    resultRowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td>
          <span class="tag is-light">${cityssm.escapeHTML(
            orderFormData.contractTypeIdText || '(Unknown Contract Type)'
          )}</span><br />
          <span class="is-size-7">${cityssm.escapeHTML(cemeteryName)}</span><br />
          <span class="is-size-7">${cityssm.escapeHTML(burialSiteName)}</span>
        </td>
      `
    )

    resultRowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td>
          ${cityssm.escapeHTML(orderFormData.funeralDateString || '(No Funeral Date)')}<br />
          <span class="is-size-7">${cityssm.escapeHTML(
            orderFormData.funeralTimeString || '(No Funeral Time)'
          )}</span><br />
          <span class="is-size-7">${cityssm.escapeHTML(funeralHomeName)}</span>
        </td>
      `
    )

    resultRowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td>
          <span class="tag ${processedStatus ? 'is-success' : 'is-warning'}">
            ${processedStatus ? 'Processed' : 'Not Processed'}
          </span>
        </td>
      `
    )

    return resultRowElement
  }

  function renderOrderForms(responseJSON: DoSearchOrderFormsResponse): void {
    if (responseJSON.orderForms.length === 0) {
      searchResultsContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">
            There are no order forms that meet the search criteria.
          </p>
        </div>
      `

      return
    }

    const resultsTbodyElement = document.createElement('tbody')

    for (const orderForm of responseJSON.orderForms) {
      resultsTbodyElement.append(buildOrderFormRowElement(orderForm))
    }

    searchResultsContainerElement.innerHTML = /* html */ `
      <table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
        <thead>
          <tr>
            <th>#</th>
            <th>Submitted</th>
            <th>Name</th>
            <th>Contract / Site</th>
            <th>Funeral Details</th>
            <th>Processed</th>
          </tr>
        </thead>
      </table>
    `

    searchResultsContainerElement
      .querySelector('table')
      ?.append(resultsTbodyElement)

    searchResultsContainerElement.insertAdjacentHTML(
      'beforeend',
      sunrise.getSearchResultsPagerHTML(
        Math.trunc(Number(limitElement.value)),
        responseJSON.offset,
        responseJSON.count
      )
    )

    searchResultsContainerElement
      .querySelector("button[data-page='previous']")
      ?.addEventListener('click', previousAndGetOrderForms)

    searchResultsContainerElement
      .querySelector("button[data-page='next']")
      ?.addEventListener('click', nextAndGetOrderForms)
  }

  function getOrderForms(): void {
    searchResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHTML(
      'Loading Order Forms...'
    )

    cityssm.postJSON(
      `${sunrise.urlPrefix}/contracts/orderForms/doSearchOrderForms`,
      searchFilterFormElement,
      renderOrderForms
    )
  }

  function resetOffsetAndGetOrderForms(): void {
    offsetElement.value = '0'
    getOrderForms()
  }

  function previousAndGetOrderForms(): void {
    offsetElement.value = Math.max(
      Math.trunc(Number(offsetElement.value)) -
        Math.trunc(Number(limitElement.value)),
      0
    ).toString()

    getOrderForms()
  }

  function nextAndGetOrderForms(): void {
    offsetElement.value = (
      Math.trunc(Number(offsetElement.value)) +
      Math.trunc(Number(limitElement.value))
    ).toString()

    getOrderForms()
  }

  const filterElements = searchFilterFormElement.querySelectorAll('input, select')

  for (const filterElement of filterElements) {
    filterElement.addEventListener('change', resetOffsetAndGetOrderForms)
  }

  searchFilterFormElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()
  })

  getOrderForms()
}

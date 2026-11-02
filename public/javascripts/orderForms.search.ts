import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { CityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type { i18n } from 'i18next'

import type { DoDeleteOrderFormResponse } from '../../handlers/contractsPost/doDeleteOrderForm.js'
import type { DoProcessOrderFormResponse } from '../../handlers/contractsPost/doProcessOrderForm.js'
import type { DoSearchOrderFormsResponse } from '../../handlers/contractsPost/doSearchOrderForms.js'
import type { OrderForm } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: CityssmGlobal
declare const bulmaJS: BulmaJS
declare const i18next: i18n

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

    const purchaserName =
      orderFormData.purchaserName || i18next.t('contracts.noPurchaser')

    let deceasedName = i18next.t('contracts.noName')

    if ('deceasedName' in orderFormData) {
      deceasedName = orderFormData.deceasedName
    } else if (
      'deceasedSameAsPurchaser' in orderFormData &&
      orderFormData.deceasedSameAsPurchaser === 'true'
    ) {
      deceasedName = purchaserName
    }

    const funeralHomeName =
      orderFormData.funeralHomeIdText || i18next.t('contracts.noFuneralHome')

    const cemeteryName =
      orderFormData.cemeteryIdText || i18next.t('contracts.noCemetery')

    const burialSiteName =
      orderFormData.burialSiteName || i18next.t('contracts.noBurialSite')

    const isOrderFormProcessed = orderForm.isOrderFormProcessed === 1

    const resultRowElement = document.createElement('tr')
    resultRowElement.className = 'avoid-page-break'

    const viewUrl = `${sunrise.urlPrefix}/contracts/orderForms/${orderForm.orderFormId}`

    resultRowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td title="${cityssm.escapeHTML(i18next.t('contracts.orderForms'))}">
          <a
            class="is-view-order-form-link"
            data-order-form-id="${cityssm.escapeHTML(orderForm.orderFormId.toString())}"
            href="${cityssm.escapeHTML(viewUrl)}"
          >#${cityssm.escapeHTML(orderForm.orderFormId.toString())}</a>
        </td>
      `
    )

    resultRowElement
      .querySelector('.is-view-order-form-link')
      ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault()
        void openOrderFormModal(orderForm.orderFormId)
      })

    resultRowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td title="${cityssm.escapeHTML(i18next.t('date'))}">
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
          <strong title="${cityssm.escapeHTML(i18next.t('contracts.deceasedName'))}">${cityssm.escapeHTML(deceasedName)}</strong><br />
          <span class="is-size-7" title="${cityssm.escapeHTML(i18next.t('contracts.purchaserName'))}">
            ${cityssm.escapeHTML(purchaserName)}
          </span>
        </td>
      `
    )

    resultRowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td>
          <span class="tag is-light" title="${cityssm.escapeHTML(i18next.t('contracts.contractType'))}">
            ${cityssm.escapeHTML(
              orderFormData.contractTypeIdText || i18next.t('contracts.noValue')
            )}
          </span><br />
          <span class="is-size-7" title="${cityssm.escapeHTML(i18next.t('cemetery'))}">
            ${cityssm.escapeHTML(cemeteryName)}
          </span><br />
          <span class="is-size-7" title="${cityssm.escapeHTML(i18next.t('cemeteries.burialSite'))}">
            ${cityssm.escapeHTML(burialSiteName)}
          </span>
        </td>
      `
    )

    resultRowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td title="${cityssm.escapeHTML(i18next.t('contracts.serviceDate'))}">
          ${cityssm.escapeHTML(orderFormData.funeralDateString ?? i18next.t('contracts.noEndDate'))}<br />
          <span class="is-size-7">
            ${cityssm.escapeHTML(
              orderFormData.funeralTimeString ?? i18next.t('time')
            )}
          </span><br />
          <span class="is-size-7">${cityssm.escapeHTML(funeralHomeName)}</span>
        </td>
      `
    )

    resultRowElement.insertAdjacentHTML(
      'beforeend',
      /* html */ `
        <td title="${cityssm.escapeHTML(i18next.t('status'))}">
          <span class="tag ${isOrderFormProcessed ? 'is-success' : 'is-warning'}">
            ${cityssm.escapeHTML(i18next.t(isOrderFormProcessed ? 'contracts.processed' : 'contracts.notProcessed'))}
          </span>
        </td>
      `
    )

    return resultRowElement
  }

  function closeOrderFormModal(modalElement: HTMLElement): void {
    modalElement.remove()
  }

  function processOrderForm(
    orderFormId: string,
    modalElement: HTMLElement
  ): void {
    cityssm.postJSON(
      `${sunrise.urlPrefix}/contracts/orderForms/${orderFormId}/doProcessOrderForm`,
      {},
      (responseJSON: DoProcessOrderFormResponse) => {
        if (responseJSON.success) {
          closeOrderFormModal(modalElement)
          getOrderForms()
          return
        }

        bulmaJS.alert({
          contextualColorName: 'danger',
          title: i18next.t('error'),
          message: responseJSON.errorMessage
        })
      }
    )
  }

  function deleteOrderForm(orderFormId: string, modalElement: HTMLElement): void {
    cityssm.postJSON(
      `${sunrise.urlPrefix}/contracts/orderForms/${orderFormId}/doDeleteOrderForm`,
      {},
      (responseJSON: DoDeleteOrderFormResponse) => {
        if (responseJSON.success) {
          closeOrderFormModal(modalElement)
          getOrderForms()
          return
        }

        bulmaJS.alert({
          contextualColorName: 'danger',
          title: i18next.t('error'),
          message: responseJSON.errorMessage
        })
      }
    )
  }

  function initializeOrderFormModal(modalElement: HTMLElement): void {
    const orderFormId = (
      modalElement.querySelector('#orderForm--orderFormId') as HTMLInputElement | null
    )?.value

    if (orderFormId === undefined || orderFormId === '') {
      throw new Error('Order form id not found.')
    }

    const closeModal = (): void => {
      closeOrderFormModal(modalElement)
    }

    modalElement
      .querySelector('.modal-background')
      ?.addEventListener('click', closeModal)
    modalElement.querySelector('.delete')?.addEventListener('click', closeModal)
    modalElement
      .querySelector('#button--closeOrderFormModal')
      ?.addEventListener('click', closeModal)
    modalElement
      .querySelector('#button--printOrderForm')
      ?.addEventListener('click', () => {
        globalThis.print()
      })

    modalElement
      .querySelector('#button--processOrderForm')
      ?.addEventListener('click', () => {
        bulmaJS.confirm({
          contextualColorName: 'info',
          title: i18next.t('contracts.orderFormsProcess'),
          message: i18next.t('contracts.processOrderFormWarning'),

          okButton: {
            callbackFunction: () => {
              globalThis.location.assign(
                `${sunrise.urlPrefix}/contracts/new?orderFormId=${encodeURIComponent(orderFormId)}`
              )
            },
            text: i18next.t('contracts.processOrderFormInNewContract')
          },

          cancelButton: {
            callbackFunction: () => {
              processOrderForm(orderFormId, modalElement)
            },
            text: i18next.t('contracts.processOrderFormAsProcessed')
          }
        })
      })

    modalElement
      .querySelector('#button--deleteOrderForm')
      ?.addEventListener('click', () => {
        bulmaJS.confirm({
          contextualColorName: 'warning',
          title: i18next.t('contracts.orderFormsDelete'),
          message: i18next.t('contracts.deleteConfirmation'),
          okButton: {
            callbackFunction: () => {
              deleteOrderForm(orderFormId, modalElement)
            },
            text: i18next.t('delete')
          }
        })
      })
  }

  async function openOrderFormModal(orderFormId: number): Promise<void> {
    const response = await fetch(
      `${sunrise.urlPrefix}/contracts/orderForms/${encodeURIComponent(orderFormId.toString())}?modal=true`
    )

    if (!response.ok) {
      bulmaJS.alert({
        contextualColorName: 'danger',
        title: i18next.t('error'),
        message: i18next.t('error')
      })
      return
    }

    const html = await response.text()
    const modalDocument = new DOMParser().parseFromString(html, 'text/html')

    const modalElement = modalDocument.querySelector(
      '#modal--orderForm'
    ) as HTMLElement | null

    if (modalElement === null) {
      bulmaJS.alert({
        contextualColorName: 'danger',
        title: i18next.t('error'),
        message: i18next.t('error')
      })
      return
    }

    document.body.append(modalElement)
    initializeOrderFormModal(modalElement)
  }

  function renderOrderForms(responseJSON: DoSearchOrderFormsResponse): void {
    if (responseJSON.orderForms.length === 0) {
      searchResultsContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">
            ${cityssm.escapeHTML(i18next.t('noResults'))}
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
            <th>${cityssm.escapeHTML(i18next.t('date'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('name'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('contracts.contractType'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('contracts.serviceDate'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('status'))}</th>
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
      i18next.t('loading')
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

  const filterElements =
    searchFilterFormElement.querySelectorAll('input, select')

  for (const filterElement of filterElements) {
    filterElement.addEventListener('change', resetOffsetAndGetOrderForms)
  }

  searchFilterFormElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()
  })

  if (i18next.isInitialized) {
    getOrderForms()
  } else {
    i18next.on('initialized', getOrderForms)
  }
}

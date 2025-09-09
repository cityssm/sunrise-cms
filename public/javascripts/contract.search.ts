import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Contract } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: Record<string, unknown>
;(() => {
  const sunrise = exports.sunrise as Sunrise

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

  function getContractTimeHtml(contract: Contract): string {
    if (contract.contractIsFuture === 1) {
      return `<span class="has-tooltip-right" data-tooltip="Future Contract">
          <i class="fa-solid fa-fast-forward" aria-label="Future Contract"></i>
          </span>`
    } else if (contract.contractIsActive === 1) {
      return `<span class="has-tooltip-right" data-tooltip="Current Contract">
          <i class="fa-solid fa-play" aria-label="Current Contract"></i>
          </span>`
    } else {
      return `<span class="has-tooltip-right" data-tooltip="Past Contract">
          <i class="fa-solid fa-stop" aria-label="Past Contract"></i>
          </span>`
    }
  }

  function getContactsHTML(contract: Contract): string {
    let contactsHTML = ''

    for (const interment of contract.contractInterments ?? []) {
      contactsHTML += `<li class="has-tooltip-left"
          data-tooltip="${contract.isPreneed ? 'Recipient' : 'Deceased'}">
          <span class="fa-li"><i class="fa-solid fa-user"></i></span>
          ${cityssm.escapeHTML(interment.deceasedName ?? '')}
          </li>`
    }

    if (contract.purchaserName !== '') {
      contactsHTML += `<li class="has-tooltip-left has-text-grey"
          data-tooltip="Purchaser">
          <span class="fa-li"><i class="fa-solid fa-hand-holding-dollar"></i></span>
          ${cityssm.escapeHTML(contract.purchaserName)}
          </li>`
    }

    if (contract.funeralHomeName !== null && contract.funeralHomeName !== '') {
      contactsHTML += `<li class="has-tooltip-left has-text-grey"
          data-tooltip="Funeral Home">
          <span class="fa-li"><i class="fa-solid fa-place-of-worship"></i></span>
          ${cityssm.escapeHTML(contract.funeralHomeName)}
          </li>`
    }
    return contactsHTML
  }

  // eslint-disable-next-line complexity
  function renderContracts(rawResponseJSON: unknown): void {
    const responseJSON = rawResponseJSON as {
      contracts: Contract[]
      count: number
      offset: number
    }

    if (responseJSON.contracts.length === 0) {
      searchResultsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">
          There are no contracts that meet the search criteria.
        </p>
        </div>`

      return
    }

    const resultsTbodyElement = document.createElement('tbody')

    for (const contract of responseJSON.contracts) {
      const contractTimeHTML = getContractTimeHtml(contract)
      const contactsHTML = getContactsHTML(contract)

      const feeTotal = (
        contract.contractFees?.reduce(
          (soFar, currentFee): number =>
            soFar +
            ((currentFee.feeAmount ?? 0) + (currentFee.taxAmount ?? 0)) *
              (currentFee.quantity ?? 0),
          0
        ) ?? 0
      ).toFixed(2)

      const transactionTotal = (
        contract.contractTransactions?.reduce(
          (soFar, currentTransaction): number =>
            soFar + currentTransaction.transactionAmount,
          0
        ) ?? 0
      ).toFixed(2)

      let feeIconHTML = ''

      if (feeTotal !== '0.00' || transactionTotal !== '0.00') {
        feeIconHTML = `<span class="icon"
          data-tooltip="Total Fees: $${feeTotal}"
          aria-label="Total Fees: $${feeTotal}">
          <i class="fa-solid fa-dollar-sign ${
            feeTotal === transactionTotal
              ? 'has-text-success'
              : 'has-text-danger'
          }"></i>
        </span>`
      }

      const burialSiteLinkClass =
        contract.burialSiteIsActive === 0 ? 'has-text-danger-dark' : ''

      // eslint-disable-next-line no-unsanitized/method
      resultsTbodyElement.insertAdjacentHTML(
        'beforeend',
        `<tr class="avoid-page-break">
          <td class="has-width-1">
            ${contractTimeHTML}
          </td><td>
            <a class="has-text-weight-bold"
              href="${sunrise.getContractURL(contract.contractId)}">
              ${cityssm.escapeHTML(contract.contractType)}
            </a><br />
            <span class="is-size-7">#${contract.contractId}</span>
          </td><td>
            ${
              (contract.burialSiteId ?? -1) === -1
                ? '<span class="has-text-grey">(No Burial Site)</span>'
                : `<a class="has-tooltip-right ${burialSiteLinkClass}"
                    data-tooltip="${cityssm.escapeHTML(contract.burialSiteType ?? '')}"
                    href="${sunrise.getBurialSiteURL(contract.burialSiteId ?? '')}">
                      ${cityssm.escapeHTML(contract.burialSiteName ?? '')}
                    </a>`
            }<br />
            <span class="is-size-7">${cityssm.escapeHTML(contract.cemeteryName ?? '')}</span>
          </td><td>
            ${contract.contractStartDateString}
          </td><td>
            ${
              contract.contractEndDate === null &&
              contract.contractEndDateString === undefined
                ? '<span class="has-text-grey">(No End Date)</span>'
                : contract.contractEndDateString
            }
          </td><td>
            ${
              contactsHTML === ''
                ? ''
                : `<ul class="fa-ul ml-5">${contactsHTML}</ul>`
            }
          </td><td>
            ${feeIconHTML}
          </td><td class="is-hidden-print">
            ${
              contract.printEJS === undefined
                ? ''
                : `<a class="button is-small" data-tooltip="Print"
                    href="${sunrise.urlPrefix}/print/${contract.printEJS}/?contractId=${contract.contractId.toString()}" target="_blank">
                    <span class="icon"><i class="fa-solid fa-print" aria-label="Print"></i></span>
                    </a>`
            }
          </td></tr>`
      )
    }

    searchResultsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
      <thead><tr>
        <th class="has-width-1"></th>
        <th>Contract Type</th>
        <th>Burial Site</th>
        <th>Contract Date</th>
        <th>End Date</th>
        <th>Contacts</th>
        <th class="has-width-1"><span class="is-sr-only">Fees and Transactions</span></th>
        <th class="has-width-1 is-hidden-print"><span class="is-sr-only">Print</span></th>
      </tr></thead>
      <table>`

    searchResultsContainerElement
      .querySelector('table')
      ?.append(resultsTbodyElement)

    // eslint-disable-next-line no-unsanitized/method
    searchResultsContainerElement.insertAdjacentHTML(
      'beforeend',
      sunrise.getSearchResultsPagerHTML(
        Number.parseInt(limitElement.value, 10),
        responseJSON.offset,
        responseJSON.count
      )
    )

    searchResultsContainerElement
      .querySelector("button[data-page='previous']")
      ?.addEventListener('click', previousAndGetContracts)

    searchResultsContainerElement
      .querySelector("button[data-page='next']")
      ?.addEventListener('click', nextAndGetContracts)
  }

  function getContracts(): void {
    // eslint-disable-next-line no-unsanitized/property
    searchResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHTML(
      'Loading Contracts...'
    )

    cityssm.postJSON(
      `${sunrise.urlPrefix}/contracts/doSearchContracts`,
      searchFilterFormElement,
      renderContracts
    )
  }

  function resetOffsetAndGetContracts(): void {
    offsetElement.value = '0'
    getContracts()
  }

  function previousAndGetContracts(): void {
    offsetElement.value = Math.max(
      Number.parseInt(offsetElement.value, 10) -
        Number.parseInt(limitElement.value, 10),
      0
    ).toString()
    getContracts()
  }

  function nextAndGetContracts(): void {
    offsetElement.value = (
      Number.parseInt(offsetElement.value, 10) +
      Number.parseInt(limitElement.value, 10)
    ).toString()
    getContracts()
  }

  const filterElements =
    searchFilterFormElement.querySelectorAll('input, select')

  for (const filterElement of filterElements) {
    filterElement.addEventListener('change', resetOffsetAndGetContracts)
  }

  searchFilterFormElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()
  })

  getContracts()
})()

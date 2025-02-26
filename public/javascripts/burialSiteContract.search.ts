import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { BurialSiteContract } from '../../types/recordTypes.js'

import type { LOS } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: Record<string, unknown>
;(() => {
  const los = exports.los as LOS

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
  function renderContracts(rawResponseJSON: unknown): void {
    const responseJSON = rawResponseJSON as {
      count: number
      offset: number
      burialSiteContracts: BurialSiteContract[]
    }

    if (responseJSON.burialSiteContracts.length === 0) {
      searchResultsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">
        There are no contracts that meet the search criteria.
        </p>
        </div>`

      return
    }

    const resultsTbodyElement = document.createElement('tbody')

    const nowDateString = cityssm.dateToString(new Date())

    for (const burialSiteContract of responseJSON.burialSiteContracts) {
      let contractTimeHTML = ''

      if (
        burialSiteContract.contractStartDateString! <= nowDateString &&
        (burialSiteContract.contractEndDateString === '' ||
          burialSiteContract.contractEndDateString! >= nowDateString)
      ) {
        contractTimeHTML = `<span class="has-tooltip-right" data-tooltip="Current Contract">
          <i class="fas fa-play" aria-label="Current Contract"></i>
          </span>`
      } else if (burialSiteContract.contractStartDateString! > nowDateString) {
        contractTimeHTML = `<span class="has-tooltip-right" data-tooltip="Future Contract">
          <i class="fas fa-fast-forward" aria-label="Future Contract"></i>
          </span>`
      } else {
        contractTimeHTML = `<span class="has-tooltip-right" data-tooltip="Past Contract">
          <i class="fas fa-stop" aria-label="Past Contract"></i>
          </span>`
      }

      let deceasedHTML = ''

      for (const interment of burialSiteContract.burialSiteContractInterments ?? []) {
        deceasedHTML += `<li class="has-tooltip-left">
          ${cityssm.escapeHTML(interment.deceasedName ?? '')}
          </li>`
      }

      const feeTotal = (
        burialSiteContract.burialSiteContractFees?.reduce(
          (soFar, currentFee): number =>
            soFar +
            ((currentFee.feeAmount ?? 0) + (currentFee.taxAmount ?? 0)) *
              (currentFee.quantity ?? 0),
          0
        ) ?? 0
      ).toFixed(2)

      const transactionTotal = (
        burialSiteContract.burialSiteContractTransactions?.reduce(
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
          <i class="fas fa-dollar-sign ${
            feeTotal === transactionTotal
              ? 'has-text-success'
              : 'has-text-danger'
          }" aria-hidden="true"></i>
        </span>`
      }

      // eslint-disable-next-line no-unsanitized/method
      resultsTbodyElement.insertAdjacentHTML(
        'beforeend',
        `<tr>
          <td class="has-width-1">
            ${contractTimeHTML}
          </td><td>
            <a class="has-text-weight-bold"
              href="${los.getBurialSiteContractURL(burialSiteContract.burialSiteContractId)}">
              ${cityssm.escapeHTML(burialSiteContract.contractType ?? '')}
            </a><br />
            <span class="is-size-7">#${burialSiteContract.burialSiteContractId}</span>
          </td><td>
            ${
              (burialSiteContract.burialSiteId ?? -1) === -1
                ? `<span class="has-text-grey">(No Burial Site)</span>`
                : `<a class="has-tooltip-right" data-tooltip="${cityssm.escapeHTML(burialSiteContract.burialSiteType ?? '')}"
                    href="${los.getBurialSiteURL(burialSiteContract.burialSiteId)}">
                    ${cityssm.escapeHTML(burialSiteContract.burialSiteName ?? '')}
                    </a>`
            }<br />
            <span class="is-size-7">${cityssm.escapeHTML(burialSiteContract.cemeteryName ?? '')}</span>
          </td><td>
            ${burialSiteContract.contractStartDateString}
          </td><td>
            ${
              burialSiteContract.contractEndDate
                ? burialSiteContract.contractEndDateString
                : '<span class="has-text-grey">(No End Date)</span>'
            }
          </td><td>
            ${
              deceasedHTML === ''
                ? ''
                : `<ul class="fa-ul ml-5">${deceasedHTML}</ul>`
            }
          </td><td>
            ${feeIconHTML}
          </td><td>
            ${
              burialSiteContract.printEJS
                ? `<a class="button is-small" data-tooltip="Print"
                    href="${los.urlPrefix}/print/${burialSiteContract.printEJS}/?burialSiteContractId=${burialSiteContract.burialSiteContractId.toString()}" target="_blank">
                    <i class="fas fa-print" aria-label="Print"></i>
                    </a>`
                : ''
            }</td></tr>`
      )
    }

    searchResultsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
      <thead><tr>
      <th class="has-width-1"></th>
      <th>Contract Type</th>
      <th>Burial Site</th>
      <th>Contract Date</th>
      <th>End Date</th>
      <th>Deceased</th>
      <th class="has-width-1"><span class="is-sr-only">Fees and Transactions</span></th>
      <th class="has-width-1"><span class="is-sr-only">Print</span></th>
      </tr></thead>
      <table>`

    searchResultsContainerElement
      .querySelector('table')
      ?.append(resultsTbodyElement)

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
      .querySelector("button[data-page='previous']")
      ?.addEventListener('click', previousAndGetContracts)

    searchResultsContainerElement
      .querySelector("button[data-page='next']")
      ?.addEventListener('click', nextAndGetContracts)
  }

  function getBurialSiteContracts(): void {
    // eslint-disable-next-line no-unsanitized/property
    searchResultsContainerElement.innerHTML = los.getLoadingParagraphHTML(
      `Loading Contracts...`
    )

    cityssm.postJSON(
      `${los.urlPrefix}/contracts/doSearchBurialSiteContracts`,
      searchFilterFormElement,
      renderContracts
    )
  }

  function resetOffsetAndGetContracts(): void {
    offsetElement.value = '0'
    getBurialSiteContracts()
  }

  function previousAndGetContracts(): void {
    offsetElement.value = Math.max(
      Number.parseInt(offsetElement.value, 10) - limit,
      0
    ).toString()
    getBurialSiteContracts()
  }

  function nextAndGetContracts(): void {
    offsetElement.value = (
      Number.parseInt(offsetElement.value, 10) + limit
    ).toString()
    getBurialSiteContracts()
  }

  const filterElements =
    searchFilterFormElement.querySelectorAll('input, select')

  for (const filterElement of filterElements) {
    filterElement.addEventListener('change', resetOffsetAndGetContracts)
  }

  searchFilterFormElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()
  })

  getBurialSiteContracts()
})()

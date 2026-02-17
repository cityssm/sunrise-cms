import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { Contract } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: {
  sunrise: Sunrise

  contractEndDateIsAvailable: boolean
}
;(() => {
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

  function getContractTimeHtml(contract: Contract): string {
    if (contract.contractIsFuture) {
      return /* html */ `
        <span title="Future Contract">
          <i class="fa-solid fa-fast-forward" aria-label="Future Contract"></i>
        </span>
      `
    } else if (contract.contractIsActive) {
      return /* html */ `
        <span title="Current Contract">
          <i class="fa-solid fa-play" aria-label="Current Contract"></i>
        </span>
      `
    } else {
      return /* html */ `
        <span title="Past Contract">
          <i class="fa-solid fa-stop" aria-label="Past Contract"></i>
        </span>
      `
    }
  }

  function getContactsHTML(contract: Contract): string {
    let contactsHTML = ''

    for (const interment of contract.contractInterments ?? []) {
      contactsHTML += /* html */ `
        <li title="Recipient">
          <span class="fa-li"><i class="fa-solid fa-user"></i></span>
          ${cityssm.escapeHTML(interment.deceasedName ?? '')}
        </li>
      `
    }

    if (contract.purchaserName !== '') {
      contactsHTML += /* html */ `
        <li class="has-text-grey-dark" title="Purchaser">
          <span class="fa-li"><i class="fa-solid fa-hand-holding-dollar"></i></span>
          ${cityssm.escapeHTML(contract.purchaserName)}
        </li>
      `
    }

    if (contract.funeralHomeName !== null && contract.funeralHomeName !== '') {
      contactsHTML += /* html */ `
        <li class="has-text-grey-dark" title="Funeral Home">
          <span class="fa-li"><i class="fa-solid fa-place-of-worship"></i></span>
          ${cityssm.escapeHTML(contract.funeralHomeName)}
        </li>
      `
    }
    return contactsHTML
  }

  function buildContractRowElement(contract: Contract): HTMLTableRowElement {
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
      feeIconHTML = /* html */ `
        <span class="icon"
          title="Total Fees: $${feeTotal}">
          <i class="fa-solid fa-dollar-sign ${
            feeTotal === transactionTotal
              ? 'has-text-success'
              : 'has-text-danger'
          }"></i>
        </span>
      `
    }

    const burialSiteLinkClass =
      contract.burialSiteIsActive === 0 ? 'has-text-danger-dark' : ''

    const contractRowElement = document.createElement('tr')
    contractRowElement.className = 'avoid-page-break'

    // eslint-disable-next-line no-unsanitized/property
    contractRowElement.innerHTML = /* html */ `
      ${
        exports.contractEndDateIsAvailable
          ? `<td class="has-width-1">${contractTimeHTML}</td>`
          : ''
      }
      <td>
        <a class="has-text-weight-bold"
          href="${sunrise.getContractUrl(contract.contractId)}">
          ${cityssm.escapeHTML(contract.contractType)}
        </a><br />
        <span class="is-size-7">#${contract.contractId}</span>
      </td>
      <td>
        ${
          (contract.contractServiceTypes ?? []).length === 0
            ? '<span class="has-text-grey-dark is-size-7">(None)</span>'
            : (contract.contractServiceTypes ?? [])
                .map((st) => cityssm.escapeHTML(st.serviceType))
                .join(', ')
        }
      </td>
      <td>
        ${
          (contract.burialSiteId ?? -1) === -1
            ? '<span class="has-text-grey-dark">(No Burial Site)</span>'
            : /* html */ `
              <a class="${burialSiteLinkClass}"
                href="${sunrise.getBurialSiteUrl(contract.burialSiteId ?? '')}"
                title="${cityssm.escapeHTML(contract.burialSiteType ?? '')}"
              >
                ${cityssm.escapeHTML(contract.burialSiteName ?? '')}
              </a>
            `
        }<br />
        <span class="is-size-7">${cityssm.escapeHTML(contract.cemeteryName ?? '')}</span>
      </td>
      <td>
        ${cityssm.escapeHTML(contract.contractStartDateString)}
      </td>
      ${
        exports.contractEndDateIsAvailable
          ? /* html */ `
            <td>
              ${
                contract.contractEndDate === null &&
                contract.contractEndDateString === undefined
                  ? '<span class="has-text-grey-dark">(No End Date)</span>'
                  : contract.contractEndDateString
              }
            </td>
          `
          : ''
      }
      <td>
        <ul class="fa-ul ml-5">${contactsHTML}</ul>
      </td>
      <td>
        ${feeIconHTML}
      </td>
      <td class="is-hidden-print">
        ${
          contract.printEJS === undefined
            ? ''
            : /*html */ `
              <a
                class="button is-small"
                href="${sunrise.urlPrefix}/print/${contract.printEJS}/?contractId=${contract.contractId.toString()}"
                title="Print"
                target="_blank"
              >
                <span class="icon"><i class="fa-solid fa-print" aria-label="Print"></i></span>
              </a>
            `
        }
      </td>
    `

    return contractRowElement
  }

  function renderContracts(rawResponseJSON: unknown): void {
    const responseJSON = rawResponseJSON as {
      contracts: Contract[]
      count: number
      offset: number
    }

    if (responseJSON.contracts.length === 0) {
      searchResultsContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">
            There are no contracts that meet the search criteria.
          </p>
        </div>
      `

      return
    }

    const resultsTbodyElement = document.createElement('tbody')

    for (const contract of responseJSON.contracts) {
      const contractRowElement = buildContractRowElement(contract)
      resultsTbodyElement.append(contractRowElement)
    }

    // eslint-disable-next-line no-unsanitized/property
    searchResultsContainerElement.innerHTML = /* html */ `
      <table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
        <thead>
          <tr>
            ${
              exports.contractEndDateIsAvailable
                ? /* html */ `
                  <th class="has-width-1">
                    <span class="is-sr-only">Contract Time</span>
                  </th>
                `
                : ''
            }
            <th>Contract Type</th>
            <th>Service Types</th>
            <th>Burial Site</th>
            <th>Contract Date</th>
            ${exports.contractEndDateIsAvailable ? '<th>End Date</th>' : ''}
            <th>Contacts</th>
            <th class="has-width-1"><span class="is-sr-only">Fees and Transactions</span></th>
            <th class="has-width-1 is-hidden-print"><span class="is-sr-only">Print</span></th>
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

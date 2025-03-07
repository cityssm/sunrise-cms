"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const searchFilterFormElement = document.querySelector('#form--searchFilters');
    const searchResultsContainerElement = document.querySelector('#container--searchResults');
    const limit = Number.parseInt(document.querySelector('#searchFilter--limit').value, 10);
    const offsetElement = document.querySelector('#searchFilter--offset');
    // eslint-disable-next-line complexity
    function renderContracts(rawResponseJSON) {
        const responseJSON = rawResponseJSON;
        if (responseJSON.contracts.length === 0) {
            searchResultsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">
        There are no contracts that meet the search criteria.
        </p>
        </div>`;
            return;
        }
        const resultsTbodyElement = document.createElement('tbody');
        const nowDateString = cityssm.dateToString(new Date());
        for (const contract of responseJSON.contracts) {
            let contractTimeHTML = '';
            if (contract.contractStartDateString <= nowDateString &&
                (contract.contractEndDateString === '' ||
                    contract.contractEndDateString >= nowDateString)) {
                contractTimeHTML = `<span class="has-tooltip-right" data-tooltip="Current Contract">
          <i class="fas fa-play" aria-label="Current Contract"></i>
          </span>`;
            }
            else if (contract.contractStartDateString > nowDateString) {
                contractTimeHTML = `<span class="has-tooltip-right" data-tooltip="Future Contract">
          <i class="fas fa-fast-forward" aria-label="Future Contract"></i>
          </span>`;
            }
            else {
                contractTimeHTML = `<span class="has-tooltip-right" data-tooltip="Past Contract">
          <i class="fas fa-stop" aria-label="Past Contract"></i>
          </span>`;
            }
            let deceasedHTML = '';
            for (const interment of contract.contractInterments ?? []) {
                deceasedHTML += `<li class="has-tooltip-left">
          <span class="fa-li"><i class="fas fa-user"></i></span>
          ${cityssm.escapeHTML(interment.deceasedName ?? '')}
          </li>`;
            }
            const feeTotal = (contract.contractFees?.reduce((soFar, currentFee) => soFar +
                ((currentFee.feeAmount ?? 0) + (currentFee.taxAmount ?? 0)) *
                    (currentFee.quantity ?? 0), 0) ?? 0).toFixed(2);
            const transactionTotal = (contract.contractTransactions?.reduce((soFar, currentTransaction) => soFar + currentTransaction.transactionAmount, 0) ?? 0).toFixed(2);
            let feeIconHTML = '';
            if (feeTotal !== '0.00' || transactionTotal !== '0.00') {
                feeIconHTML = `<span class="icon"
          data-tooltip="Total Fees: $${feeTotal}"
          aria-label="Total Fees: $${feeTotal}">
          <i class="fas fa-dollar-sign ${feeTotal === transactionTotal
                    ? 'has-text-success'
                    : 'has-text-danger'}" aria-hidden="true"></i>
        </span>`;
            }
            // eslint-disable-next-line no-unsanitized/method
            resultsTbodyElement.insertAdjacentHTML('beforeend', `<tr>
          <td class="has-width-1">
            ${contractTimeHTML}
          </td><td>
            <a class="has-text-weight-bold"
              href="${sunrise.getContractURL(contract.contractId)}">
              ${cityssm.escapeHTML(contract.contractType ?? '')}
            </a><br />
            <span class="is-size-7">#${contract.contractId}</span>
          </td><td>
            ${(contract.burialSiteId ?? -1) === -1
                ? `<span class="has-text-grey">(No Burial Site)</span>`
                : `<a class="has-tooltip-right" data-tooltip="${cityssm.escapeHTML(contract.burialSiteType ?? '')}"
                    href="${sunrise.getBurialSiteURL(contract.burialSiteId)}">
                    ${cityssm.escapeHTML(contract.burialSiteName ?? '')}
                    </a>`}<br />
            <span class="is-size-7">${cityssm.escapeHTML(contract.cemeteryName ?? '')}</span>
          </td><td>
            ${contract.contractStartDateString}
          </td><td>
            ${contract.contractEndDate
                ? contract.contractEndDateString
                : '<span class="has-text-grey">(No End Date)</span>'}
          </td><td>
            ${deceasedHTML === ''
                ? ''
                : `<ul class="fa-ul ml-5">${deceasedHTML}</ul>`}
          </td><td>
            ${feeIconHTML}
          </td><td>
            ${contract.printEJS
                ? `<a class="button is-small" data-tooltip="Print"
                    href="${sunrise.urlPrefix}/print/${contract.printEJS}/?contractId=${contract.contractId.toString()}" target="_blank">
                    <i class="fas fa-print" aria-label="Print"></i>
                    </a>`
                : ''}</td></tr>`);
        }
        searchResultsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
      <thead><tr>
      <th class="has-width-1"></th>
      <th>Contract Type</th>
      <th>Burial Site</th>
      <th>Contract Date</th>
      <th>End Date</th>
      <th>Recipient / Deceased</th>
      <th class="has-width-1"><span class="is-sr-only">Fees and Transactions</span></th>
      <th class="has-width-1"><span class="is-sr-only">Print</span></th>
      </tr></thead>
      <table>`;
        searchResultsContainerElement
            .querySelector('table')
            ?.append(resultsTbodyElement);
        // eslint-disable-next-line no-unsanitized/method
        searchResultsContainerElement.insertAdjacentHTML('beforeend', sunrise.getSearchResultsPagerHTML(limit, responseJSON.offset, responseJSON.count));
        searchResultsContainerElement
            .querySelector("button[data-page='previous']")
            ?.addEventListener('click', previousAndGetContracts);
        searchResultsContainerElement
            .querySelector("button[data-page='next']")
            ?.addEventListener('click', nextAndGetContracts);
    }
    function getContracts() {
        // eslint-disable-next-line no-unsanitized/property
        searchResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHTML(`Loading Contracts...`);
        cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doSearchContracts`, searchFilterFormElement, renderContracts);
    }
    function resetOffsetAndGetContracts() {
        offsetElement.value = '0';
        getContracts();
    }
    function previousAndGetContracts() {
        offsetElement.value = Math.max(Number.parseInt(offsetElement.value, 10) - limit, 0).toString();
        getContracts();
    }
    function nextAndGetContracts() {
        offsetElement.value = (Number.parseInt(offsetElement.value, 10) + limit).toString();
        getContracts();
    }
    const filterElements = searchFilterFormElement.querySelectorAll('input, select');
    for (const filterElement of filterElements) {
        filterElement.addEventListener('change', resetOffsetAndGetContracts);
    }
    searchFilterFormElement.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
    });
    getContracts();
})();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const los = exports.los;
    const searchFilterFormElement = document.querySelector('#form--searchFilters');
    const searchResultsContainerElement = document.querySelector('#container--searchResults');
    const limit = Number.parseInt(document.querySelector('#searchFilter--limit').value, 10);
    const offsetElement = document.querySelector('#searchFilter--offset');
    function renderLotOccupancies(rawResponseJSON) {
        const responseJSON = rawResponseJSON;
        if (responseJSON.lotOccupancies.length === 0) {
            // eslint-disable-next-line no-unsanitized/property
            searchResultsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">
        There are no ${los.escapedAliases.occupancy} records that meet the search criteria.
        </p>
        </div>`;
            return;
        }
        const resultsTbodyElement = document.createElement('tbody');
        const nowDateString = cityssm.dateToString(new Date());
        for (const burialSiteContract of responseJSON.lotOccupancies) {
            let occupancyTimeHTML = '';
            if (burialSiteContract.contractStartDateString <= nowDateString &&
                (burialSiteContract.contractEndDateString === '' ||
                    burialSiteContract.contractEndDateString >= nowDateString)) {
                occupancyTimeHTML = `<span class="has-tooltip-right" data-tooltip="Current ${los.escapedAliases.Occupancy}">
          <i class="fas fa-play" aria-label="Current ${los.escapedAliases.Occupancy}"></i>
          </span>`;
            }
            else if (burialSiteContract.contractStartDateString > nowDateString) {
                occupancyTimeHTML = `<span class="has-tooltip-right" data-tooltip="Future ${los.escapedAliases.Occupancy}">
          <i class="fas fa-fast-forward" aria-label="Future ${los.escapedAliases.Occupancy}"></i>
          </span>`;
            }
            else {
                occupancyTimeHTML = `<span class="has-tooltip-right" data-tooltip="Past ${los.escapedAliases.Occupancy}">
          <i class="fas fa-stop" aria-label="Past ${los.escapedAliases.Occupancy}"></i>
          </span>`;
            }
            let occupantsHTML = '';
            for (const occupant of burialSiteContract.burialSiteContractOccupants ?? []) {
                occupantsHTML += `<li class="has-tooltip-left" data-tooltip="${cityssm.escapeHTML(occupant.lotOccupantType ?? '')}">
          <span class="fa-li">
            <i class="fas fa-fw fa-${cityssm.escapeHTML((occupant.fontAwesomeIconClass ?? '') === ''
                    ? 'user'
                    : occupant.fontAwesomeIconClass ?? '')}" aria-hidden="true"></i>
          </span>
          ${cityssm.escapeHTML(occupant.occupantName ?? '')}
          ${cityssm.escapeHTML(occupant.occupantFamilyName ?? '')}
          </li>`;
            }
            const feeTotal = (burialSiteContract.burialSiteContractFees?.reduce((soFar, currentFee) => soFar +
                ((currentFee.feeAmount ?? 0) + (currentFee.taxAmount ?? 0)) *
                    (currentFee.quantity ?? 0), 0) ?? 0).toFixed(2);
            const transactionTotal = (burialSiteContract.burialSiteContractTransactions?.reduce((soFar, currentTransaction) => soFar + currentTransaction.transactionAmount, 0) ?? 0).toFixed(2);
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
            ${occupancyTimeHTML}
          </td><td>
            <a class="has-text-weight-bold"
              href="${los.getBurialSiteContractURL(burialSiteContract.burialSiteContractId)}">
              ${cityssm.escapeHTML(burialSiteContract.occupancyType ?? '')}
            </a><br />
            <span class="is-size-7">#${burialSiteContract.burialSiteContractId}</span>
          </td><td>
            ${(burialSiteContract.lotId ?? -1) === -1
                ? `<span class="has-text-grey">(No ${los.escapedAliases.Lot})</span>`
                : `<a class="has-tooltip-right" data-tooltip="${cityssm.escapeHTML(burialSiteContract.lotType ?? '')}" href="${los.getBurialSiteURL(burialSiteContract.lotId)}">${cityssm.escapeHTML(burialSiteContract.lotName ?? '')}</a>`}<br />
            <span class="is-size-7">${cityssm.escapeHTML(burialSiteContract.cemeteryName ?? '')}</span>
          </td><td>
            ${burialSiteContract.contractStartDateString}
          </td><td>
            ${burialSiteContract.contractEndDate
                ? burialSiteContract.contractEndDateString
                : '<span class="has-text-grey">(No End Date)</span>'}
          </td><td>
            ${occupantsHTML === ''
                ? ''
                : `<ul class="fa-ul ml-5">${occupantsHTML}</ul>`}
          </td><td>
            ${feeIconHTML}
          </td><td>
            ${burialSiteContract.printEJS
                ? `<a class="button is-small" data-tooltip="Print"
                    href="${los.urlPrefix}/print/${burialSiteContract.printEJS}/?burialSiteContractId=${burialSiteContract.burialSiteContractId.toString()}" target="_blank">
                    <i class="fas fa-print" aria-label="Print"></i>
                    </a>`
                : ''}</td></tr>`);
        }
        // eslint-disable-next-line no-unsanitized/property
        searchResultsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
      <thead><tr>
      <th class="has-width-1"></th>
      <th>${los.escapedAliases.Occupancy} Type</th>
      <th>${los.escapedAliases.Lot}</th>
      <th>${los.escapedAliases.contractStartDate}</th>
      <th>End Date</th>
      <th>${los.escapedAliases.Occupants}</th>
      <th class="has-width-1"><span class="is-sr-only">Fees and Transactions</span></th>
      <th class="has-width-1"><span class="is-sr-only">Print</span></th>
      </tr></thead>
      <table>`;
        searchResultsContainerElement
            .querySelector('table')
            ?.append(resultsTbodyElement);
        // eslint-disable-next-line no-unsanitized/method
        searchResultsContainerElement.insertAdjacentHTML('beforeend', los.getSearchResultsPagerHTML(limit, responseJSON.offset, responseJSON.count));
        searchResultsContainerElement
            .querySelector("button[data-page='previous']")
            ?.addEventListener('click', previousAndGetLotOccupancies);
        searchResultsContainerElement
            .querySelector("button[data-page='next']")
            ?.addEventListener('click', nextAndGetLotOccupancies);
    }
    function getBurialSiteContracts() {
        // eslint-disable-next-line no-unsanitized/property
        searchResultsContainerElement.innerHTML = los.getLoadingParagraphHTML(`Loading ${los.escapedAliases.Occupancies}...`);
        cityssm.postJSON(`${los.urlPrefix}/contracts/doSearchLotOccupancies`, searchFilterFormElement, renderLotOccupancies);
    }
    function resetOffsetAndGetLotOccupancies() {
        offsetElement.value = '0';
        getBurialSiteContracts();
    }
    function previousAndGetLotOccupancies() {
        offsetElement.value = Math.max(Number.parseInt(offsetElement.value, 10) - limit, 0).toString();
        getBurialSiteContracts();
    }
    function nextAndGetLotOccupancies() {
        offsetElement.value = (Number.parseInt(offsetElement.value, 10) + limit).toString();
        getBurialSiteContracts();
    }
    const filterElements = searchFilterFormElement.querySelectorAll('input, select');
    for (const filterElement of filterElements) {
        filterElement.addEventListener('change', resetOffsetAndGetLotOccupancies);
    }
    searchFilterFormElement.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
    });
    getBurialSiteContracts();
})();

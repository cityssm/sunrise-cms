(() => {
    const sunrise = exports.sunrise;
    const searchFilterFormElement = document.querySelector('#form--searchFilters');
    const searchResultsContainerElement = document.querySelector('#container--searchResults');
    const limitElement = document.querySelector('#searchFilter--limit');
    const offsetElement = document.querySelector('#searchFilter--offset');
    function getContractTimeHtml(contract) {
        if (contract.contractIsFuture) {
            return /*html*/ `
        <span title="Future Contract">
          <i class="fa-solid fa-fast-forward" aria-label="Future Contract"></i>
        </span>
      `;
        }
        else if (contract.contractIsActive) {
            return /*html*/ `
        <span title="Current Contract">
          <i class="fa-solid fa-play" aria-label="Current Contract"></i>
        </span>
      `;
        }
        else {
            return /*html*/ `
        <span title="Past Contract">
          <i class="fa-solid fa-stop" aria-label="Past Contract"></i>
        </span>
      `;
        }
    }
    function getContactsHTML(contract) {
        let contactsHTML = '';
        for (const interment of contract.contractInterments ?? []) {
            contactsHTML += /*html*/ `
        <li title="${contract.isPreneed ? 'Recipient' : 'Deceased'}">
          <span class="fa-li"><i class="fa-solid fa-user"></i></span>
          ${cityssm.escapeHTML(interment.deceasedName ?? '')}
        </li>
      `;
        }
        if (contract.purchaserName !== '') {
            contactsHTML += /*html*/ `
        <li class="has-text-grey-dark" title="Purchaser">
          <span class="fa-li"><i class="fa-solid fa-hand-holding-dollar"></i></span>
          ${cityssm.escapeHTML(contract.purchaserName)}
        </li>
      `;
        }
        if (contract.funeralHomeName !== null && contract.funeralHomeName !== '') {
            contactsHTML += /*html*/ `
        <li class="has-text-grey-dark" title="Funeral Home">
          <span class="fa-li"><i class="fa-solid fa-place-of-worship"></i></span>
          ${cityssm.escapeHTML(contract.funeralHomeName)}
        </li>
      `;
        }
        return contactsHTML;
    }
    function buildContractRowElement(contract) {
        const contractTimeHTML = getContractTimeHtml(contract);
        const contactsHTML = getContactsHTML(contract);
        const feeTotal = (contract.contractFees?.reduce((soFar, currentFee) => soFar +
            ((currentFee.feeAmount ?? 0) + (currentFee.taxAmount ?? 0)) *
                (currentFee.quantity ?? 0), 0) ?? 0).toFixed(2);
        const transactionTotal = (contract.contractTransactions?.reduce((soFar, currentTransaction) => soFar + currentTransaction.transactionAmount, 0) ?? 0).toFixed(2);
        let feeIconHTML = '';
        if (feeTotal !== '0.00' || transactionTotal !== '0.00') {
            feeIconHTML = /*html*/ `
        <span class="icon"
          title="Total Fees: $${feeTotal}">
          <i class="fa-solid fa-dollar-sign ${feeTotal === transactionTotal
                ? 'has-text-success'
                : 'has-text-danger'}"></i>
        </span>
      `;
        }
        const burialSiteLinkClass = contract.burialSiteIsActive === 0 ? 'has-text-danger-dark' : '';
        const contractRowElement = document.createElement('tr');
        contractRowElement.className = 'avoid-page-break';
        // eslint-disable-next-line no-unsanitized/property
        contractRowElement.innerHTML = /*html*/ `
      <td class="has-width-1">
        ${contractTimeHTML}
      </td>
      <td>
        <a class="has-text-weight-bold"
          href="${sunrise.getContractUrl(contract.contractId)}">
          ${cityssm.escapeHTML(contract.contractType)}
        </a><br />
        <span class="is-size-7">#${contract.contractId}</span>
      </td>
      <td>
        ${(contract.burialSiteId ?? -1) === -1
            ? '<span class="has-text-grey-dark">(No Burial Site)</span>'
            : /*html*/ `
              <a class="${burialSiteLinkClass}"
                href="${sunrise.getBurialSiteUrl(contract.burialSiteId ?? '')}"
                title="${cityssm.escapeHTML(contract.burialSiteType ?? '')}"
              >
                ${cityssm.escapeHTML(contract.burialSiteName ?? '')}
              </a>
            `}<br />
        <span class="is-size-7">${cityssm.escapeHTML(contract.cemeteryName ?? '')}</span>
      </td>
      <td>
        ${cityssm.escapeHTML(contract.contractStartDateString)}
      </td>
      <td>
        ${contract.contractEndDate === null &&
            contract.contractEndDateString === undefined
            ? '<span class="has-text-grey-dark">(No End Date)</span>'
            : contract.contractEndDateString}
      </td>
      <td>
        <ul class="fa-ul ml-5">${contactsHTML}</ul>
      </td>
      <td>
        ${feeIconHTML}
      </td>
      <td class="is-hidden-print">
        ${contract.printEJS === undefined
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
            `}
      </td>
    `;
        return contractRowElement;
    }
    function renderContracts(rawResponseJSON) {
        const responseJSON = rawResponseJSON;
        if (responseJSON.contracts.length === 0) {
            searchResultsContainerElement.innerHTML = /*html*/ `
        <div class="message is-info">
          <p class="message-body">
            There are no contracts that meet the search criteria.
          </p>
        </div>
      `;
            return;
        }
        const resultsTbodyElement = document.createElement('tbody');
        for (const contract of responseJSON.contracts) {
            const contractRowElement = buildContractRowElement(contract);
            resultsTbodyElement.append(contractRowElement);
        }
        searchResultsContainerElement.innerHTML = /*html*/ `
      <table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
        <thead>
          <tr>
            <th class="has-width-1">
              <span class="is-sr-only">Contract Time</span>
            </th>
            <th>Contract Type</th>
            <th>Burial Site</th>
            <th>Contract Date</th>
            <th>End Date</th>
            <th>Contacts</th>
            <th class="has-width-1"><span class="is-sr-only">Fees and Transactions</span></th>
            <th class="has-width-1 is-hidden-print"><span class="is-sr-only">Print</span></th>
          </tr>
        </thead>
      </table>
    `;
        searchResultsContainerElement
            .querySelector('table')
            ?.append(resultsTbodyElement);
        searchResultsContainerElement.insertAdjacentHTML('beforeend', sunrise.getSearchResultsPagerHTML(Number.parseInt(limitElement.value, 10), responseJSON.offset, responseJSON.count));
        searchResultsContainerElement
            .querySelector("button[data-page='previous']")
            ?.addEventListener('click', previousAndGetContracts);
        searchResultsContainerElement
            .querySelector("button[data-page='next']")
            ?.addEventListener('click', nextAndGetContracts);
    }
    function getContracts() {
        searchResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHTML('Loading Contracts...');
        cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doSearchContracts`, searchFilterFormElement, renderContracts);
    }
    function resetOffsetAndGetContracts() {
        offsetElement.value = '0';
        getContracts();
    }
    function previousAndGetContracts() {
        offsetElement.value = Math.max(Number.parseInt(offsetElement.value, 10) -
            Number.parseInt(limitElement.value, 10), 0).toString();
        getContracts();
    }
    function nextAndGetContracts() {
        offsetElement.value = (Number.parseInt(offsetElement.value, 10) +
            Number.parseInt(limitElement.value, 10)).toString();
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

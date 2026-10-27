{
    const sunrise = exports.sunrise;
    const searchFilterFormElement = document.querySelector('#form--searchFilters');
    const searchResultsContainerElement = document.querySelector('#container--searchResults');
    const limitElement = document.querySelector('#searchFilter--limit');
    const offsetElement = document.querySelector('#searchFilter--offset');
    function buildOrderFormRowElement(orderForm) {
        const orderFormData = orderForm.orderFormData;
        const purchaserName = orderFormData.purchaserName || '(No Purchaser)';
        let deceasedName = '(No Deceased Name)';
        if (Object.hasOwn(orderFormData, 'deceasedName')) {
            deceasedName = orderFormData.deceasedName;
        }
        else if (orderFormData.deceasedSameAsPurchaser === 'true') {
            deceasedName = purchaserName;
        }
        const funeralHomeName = orderFormData.funeralHomeIdText || '(No Funeral Home)';
        const cemeteryName = orderFormData.cemeteryIdText || '(No Cemetery)';
        const burialSiteName = orderFormData.burialSiteName || '(No Burial Site)';
        const processedStatus = orderForm.isOrderFormProcessed === 1;
        const resultRowElement = document.createElement('tr');
        resultRowElement.className = 'avoid-page-break';
        resultRowElement.insertAdjacentHTML('beforeend', `
        <td>#${cityssm.escapeHTML(orderForm.orderFormId.toString())}</td>
      `);
        resultRowElement.insertAdjacentHTML('beforeend', `
        <td>
          ${cityssm.escapeHTML(new Date(orderForm.recordCreate_timeMillis).toLocaleDateString())}
        </td>
      `);
        resultRowElement.insertAdjacentHTML('beforeend', `
        <td>
          <strong>${cityssm.escapeHTML(deceasedName)}</strong><br />
          <span class="is-size-7">${cityssm.escapeHTML(purchaserName)}</span>
        </td>
      `);
        resultRowElement.insertAdjacentHTML('beforeend', `
        <td>
          <span class="tag is-light">${cityssm.escapeHTML(orderFormData.contractTypeIdText || '(Unknown Contract Type)')}</span><br />
          <span class="is-size-7">${cityssm.escapeHTML(cemeteryName)}</span><br />
          <span class="is-size-7">${cityssm.escapeHTML(burialSiteName)}</span>
        </td>
      `);
        resultRowElement.insertAdjacentHTML('beforeend', `
        <td>
          ${cityssm.escapeHTML(orderFormData.funeralDateString || '(No Funeral Date)')}<br />
          <span class="is-size-7">${cityssm.escapeHTML(orderFormData.funeralTimeString || '(No Funeral Time)')}</span><br />
          <span class="is-size-7">${cityssm.escapeHTML(funeralHomeName)}</span>
        </td>
      `);
        resultRowElement.insertAdjacentHTML('beforeend', `
        <td>
          <span class="tag ${processedStatus ? 'is-success' : 'is-warning'}">
            ${processedStatus ? 'Processed' : 'Not Processed'}
          </span>
        </td>
      `);
        return resultRowElement;
    }
    function renderOrderForms(responseJSON) {
        if (responseJSON.orderForms.length === 0) {
            searchResultsContainerElement.innerHTML = `
        <div class="message is-info">
          <p class="message-body">
            There are no order forms that meet the search criteria.
          </p>
        </div>
      `;
            return;
        }
        const resultsTbodyElement = document.createElement('tbody');
        for (const orderForm of responseJSON.orderForms) {
            resultsTbodyElement.append(buildOrderFormRowElement(orderForm));
        }
        searchResultsContainerElement.innerHTML = `
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
    `;
        searchResultsContainerElement
            .querySelector('table')
            ?.append(resultsTbodyElement);
        searchResultsContainerElement.insertAdjacentHTML('beforeend', sunrise.getSearchResultsPagerHTML(Math.trunc(Number(limitElement.value)), responseJSON.offset, responseJSON.count));
        searchResultsContainerElement
            .querySelector("button[data-page='previous']")
            ?.addEventListener('click', previousAndGetOrderForms);
        searchResultsContainerElement
            .querySelector("button[data-page='next']")
            ?.addEventListener('click', nextAndGetOrderForms);
    }
    function getOrderForms() {
        searchResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHTML('Loading Order Forms...');
        cityssm.postJSON(`${sunrise.urlPrefix}/contracts/orderForms/doSearchOrderForms`, searchFilterFormElement, renderOrderForms);
    }
    function resetOffsetAndGetOrderForms() {
        offsetElement.value = '0';
        getOrderForms();
    }
    function previousAndGetOrderForms() {
        offsetElement.value = Math.max(Math.trunc(Number(offsetElement.value)) -
            Math.trunc(Number(limitElement.value)), 0).toString();
        getOrderForms();
    }
    function nextAndGetOrderForms() {
        offsetElement.value = (Math.trunc(Number(offsetElement.value)) +
            Math.trunc(Number(limitElement.value))).toString();
        getOrderForms();
    }
    const filterElements = searchFilterFormElement.querySelectorAll('input, select');
    for (const filterElement of filterElements) {
        filterElement.addEventListener('change', resetOffsetAndGetOrderForms);
    }
    searchFilterFormElement.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
    });
    getOrderForms();
}

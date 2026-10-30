{
    const sunrise = exports.sunrise;
    const searchFilterFormElement = document.querySelector('#form--searchFilters');
    const searchResultsContainerElement = document.querySelector('#container--searchResults');
    const limitElement = document.querySelector('#searchFilter--limit');
    const offsetElement = document.querySelector('#searchFilter--offset');
    function buildOrderFormRowElement(orderForm) {
        const orderFormData = orderForm.orderFormData;
        const purchaserName = orderFormData.purchaserName || i18next.t('contracts.noPurchaser');
        let deceasedName = i18next.t('contracts.noName');
        if ('deceasedName' in orderFormData) {
            deceasedName = orderFormData.deceasedName;
        }
        else if ('deceasedSameAsPurchaser' in orderFormData &&
            orderFormData.deceasedSameAsPurchaser === 'true') {
            deceasedName = purchaserName;
        }
        const funeralHomeName = orderFormData.funeralHomeIdText || i18next.t('contracts.noFuneralHome');
        const cemeteryName = orderFormData.cemeteryIdText || i18next.t('contracts.noCemetery');
        const burialSiteName = orderFormData.burialSiteName || i18next.t('contracts.noBurialSite');
        const isOrderFormProcessed = orderForm.isOrderFormProcessed === 1;
        const resultRowElement = document.createElement('tr');
        resultRowElement.className = 'avoid-page-break';
        resultRowElement.insertAdjacentHTML('beforeend', `
        <td title="${cityssm.escapeHTML(i18next.t('contracts.orderForms'))}">
          #${cityssm.escapeHTML(orderForm.orderFormId.toString())}
        </td>
      `);
        resultRowElement.insertAdjacentHTML('beforeend', `
        <td title="${cityssm.escapeHTML(i18next.t('date'))}">
          ${cityssm.escapeHTML(new Date(orderForm.recordCreate_timeMillis).toLocaleDateString())}
        </td>
      `);
        resultRowElement.insertAdjacentHTML('beforeend', `
        <td>
          <strong title="${cityssm.escapeHTML(i18next.t('contracts.deceasedName'))}">${cityssm.escapeHTML(deceasedName)}</strong><br />
          <span class="is-size-7" title="${cityssm.escapeHTML(i18next.t('contracts.purchaserName'))}">
            ${cityssm.escapeHTML(purchaserName)}
          </span>
        </td>
      `);
        resultRowElement.insertAdjacentHTML('beforeend', `
        <td>
          <span class="tag is-light" title="${cityssm.escapeHTML(i18next.t('contracts.contractType'))}">
            ${cityssm.escapeHTML(orderFormData.contractTypeIdText || i18next.t('contracts.noValue'))}
          </span><br />
          <span class="is-size-7" title="${cityssm.escapeHTML(i18next.t('cemetery'))}">
            ${cityssm.escapeHTML(cemeteryName)}
          </span><br />
          <span class="is-size-7" title="${cityssm.escapeHTML(i18next.t('cemeteries.burialSite'))}">
            ${cityssm.escapeHTML(burialSiteName)}
          </span>
        </td>
      `);
        resultRowElement.insertAdjacentHTML('beforeend', `
        <td title="${cityssm.escapeHTML(i18next.t('contracts.serviceDate'))}">
          ${cityssm.escapeHTML(orderFormData.funeralDateString ?? i18next.t('contracts.noEndDate'))}<br />
          <span class="is-size-7">
            ${cityssm.escapeHTML(orderFormData.funeralTimeString ?? i18next.t('time'))}
          </span><br />
          <span class="is-size-7">${cityssm.escapeHTML(funeralHomeName)}</span>
        </td>
      `);
        resultRowElement.insertAdjacentHTML('beforeend', `
        <td title="${cityssm.escapeHTML(i18next.t('status'))}">
          <span class="tag ${isOrderFormProcessed ? 'is-success' : 'is-warning'}">
            ${cityssm.escapeHTML(i18next.t(isOrderFormProcessed ? 'contracts.processed' : 'contracts.notProcessed'))}
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
            ${cityssm.escapeHTML(i18next.t('noResults'))}
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
            <th>${cityssm.escapeHTML(i18next.t('date'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('name'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('contracts.contractType'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('contracts.serviceDate'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('status'))}</th>
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
        searchResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHTML(i18next.t('loading'));
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

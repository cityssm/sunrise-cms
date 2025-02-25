"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const los = exports.los;
    const searchFilterFormElement = document.querySelector('#form--searchFilters');
    const searchResultsContainerElement = document.querySelector('#container--searchResults');
    const limit = Number.parseInt(document.querySelector('#searchFilter--limit').value, 10);
    const offsetElement = document.querySelector('#searchFilter--offset');
    function renderLots(rawResponseJSON) {
        const responseJSON = rawResponseJSON;
        if (responseJSON.lots.length === 0) {
            // eslint-disable-next-line no-unsanitized/property
            searchResultsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no ${los.escapedAliases.lots} that meet the search criteria.</p>
        </div>`;
            return;
        }
        const resultsTbodyElement = document.createElement('tbody');
        for (const lot of responseJSON.lots) {
            // eslint-disable-next-line no-unsanitized/method
            resultsTbodyElement.insertAdjacentHTML('beforeend', `<tr>
          <td>
            <a class="has-text-weight-bold" href="${los.getLotURL(lot.lotId)}">
              ${cityssm.escapeHTML(lot.lotName ?? '')}
            </a>
          </td><td>
            <a href="${los.getMapURL(lot.mapId)}">
              ${lot.mapName
                ? cityssm.escapeHTML(lot.mapName)
                : '<span class="has-text-grey">(No Name)</span>'}
            </a>
          </td><td>
            ${cityssm.escapeHTML(lot.lotType ?? '')}
          </td><td>
            ${lot.burialSiteStatusId
                ? cityssm.escapeHTML(lot.lotStatus ?? '')
                : '<span class="has-text-grey">(No Status)</span>'}<br />
            ${(lot.lotOccupancyCount ?? 0) > 0
                ? '<span class="is-size-7">Currently Occupied</span>'
                : ''}
          </td>
          </tr>`);
        }
        // eslint-disable-next-line no-unsanitized/property
        searchResultsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
      <thead><tr>
      <th>${los.escapedAliases.Lot}</th>
      <th>${los.escapedAliases.Map}</th>
      <th>${los.escapedAliases.Lot} Type</th>
      <th>Status</th>
      </tr></thead>
      <table>`;
        // eslint-disable-next-line no-unsanitized/method
        searchResultsContainerElement.insertAdjacentHTML('beforeend', los.getSearchResultsPagerHTML(limit, responseJSON.offset, responseJSON.count));
        searchResultsContainerElement
            .querySelector('table')
            ?.append(resultsTbodyElement);
        searchResultsContainerElement
            .querySelector("button[data-page='previous']")
            ?.addEventListener('click', previousAndGetLots);
        searchResultsContainerElement
            .querySelector("button[data-page='next']")
            ?.addEventListener('click', nextAndGetLots);
    }
    function getLots() {
        // eslint-disable-next-line no-unsanitized/property
        searchResultsContainerElement.innerHTML = los.getLoadingParagraphHTML(`Loading ${los.escapedAliases.Lots}...`);
        cityssm.postJSON(`${los.urlPrefix}/lots/doSearchLots`, searchFilterFormElement, renderLots);
    }
    function resetOffsetAndGetLots() {
        offsetElement.value = '0';
        getLots();
    }
    function previousAndGetLots() {
        offsetElement.value = Math.max(Number.parseInt(offsetElement.value, 10) - limit, 0).toString();
        getLots();
    }
    function nextAndGetLots() {
        offsetElement.value = (Number.parseInt(offsetElement.value, 10) + limit).toString();
        getLots();
    }
    const filterElements = searchFilterFormElement.querySelectorAll('input, select');
    for (const filterElement of filterElements) {
        filterElement.addEventListener('change', resetOffsetAndGetLots);
    }
    searchFilterFormElement.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
    });
    getLots();
})();

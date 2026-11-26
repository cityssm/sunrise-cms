{
    const { sunrise } = exports;
    const searchFilterFormElement = document.querySelector('#form--searchFilters');
    const searchResultsContainerElement = document.querySelector('#container--searchResults');
    const limitElement = document.querySelector('#searchFilter--limit');
    const offsetElement = document.querySelector('#searchFilter--offset');
    function buildCapacityTagHtml(usedCapacity, setCapacity, unit) {
        if (setCapacity === 0 && usedCapacity === 0) {
            return '';
        }
        let tagColorClass;
        if (usedCapacity === 0) {
            tagColorClass = 'is-success';
        }
        else if (setCapacity === undefined || usedCapacity < setCapacity) {
            tagColorClass = 'is-info';
        }
        else if (usedCapacity > setCapacity) {
            tagColorClass = 'is-danger';
        }
        else {
            tagColorClass = 'is-warning';
        }
        return `<div class="control">
        <div class="tags has-addons">
          <span class="tag is-dark">${unit}</span>
          <span class="tag ${tagColorClass}">
            ${usedCapacity} / ${setCapacity ?? '&nbsp;<span class="icon"><i class="fas fa-infinity"></i></span>'}
          </span>
        </div>
      </div>
    `;
    }
    function renderBurialSites(responseJSON) {
        if (responseJSON.burialSites.length === 0) {
            searchResultsContainerElement.innerHTML = `
        <div class="message is-info">
          <p class="message-body">There are no burial sites that meet the search criteria.</p>
        </div>
      `;
            return;
        }
        const resultsTbodyElement = document.createElement('tbody');
        for (const burialSite of responseJSON.burialSites) {
            const cemeteryNameHtml = burialSite.cemeteryName === ''
                ? '<span class="has-text-grey">(No Name)</span>'
                : cityssm.escapeHTML(burialSite.cemeteryName ?? '');
            const tableRowElement = document.createElement('tr');
            tableRowElement.insertAdjacentHTML('beforeend', `
          <td>
            <a class="has-text-weight-bold" href="${sunrise.getBurialSiteUrl(burialSite.burialSiteId)}">
              ${cityssm.escapeHTML(burialSite.burialSiteName)}
            </a><br />
            <span class="is-size-7">
              ${cityssm.escapeHTML(burialSite.burialSiteType ?? '(No Type)')}
            </span>
          </td>
        `);
            tableRowElement.insertAdjacentHTML('beforeend', `
          <td>
            ${burialSite.cemeteryId === null
                ? '<span class="has-text-grey">(No Cemetery)</span>'
                : `
                  <a href="${sunrise.getCemeteryUrl(burialSite.cemeteryId)}">
                    ${cemeteryNameHtml}
                  </a>
                `}
          </td>
        `);
            tableRowElement.insertAdjacentHTML('beforeend', `
          <td>
            <div class="field is-grouped is-grouped-multiline">
              ${buildCapacityTagHtml(burialSite.bodyCapacityUsed ?? 0, burialSite.setBodyCapacity ?? undefined, 'Bodies')}
              ${buildCapacityTagHtml(burialSite.crematedCapacityUsed ?? 0, burialSite.setCrematedCapacity ?? undefined, 'Cremains')}
            </div>
          </td>
        `);
            tableRowElement.insertAdjacentHTML('beforeend', `
          <td>
            ${burialSite.burialSiteStatusId === null ||
                burialSite.burialSiteStatusId === undefined
                ? '<span class="has-text-grey-dark">(No Status)</span>'
                : cityssm.escapeHTML(burialSite.burialSiteStatus ?? '')}<br />
            ${(burialSite.contractCount ?? 0) > 0
                ? '<span class="is-size-7">Has Current Contracts</span>'
                : ''}
          </td>
        `);
            resultsTbodyElement.append(tableRowElement);
        }
        searchResultsContainerElement.innerHTML = `
      <table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
        <thead>
          <tr>
            <th>Burial Site</th>
            <th>Cemetery</th>
            <th>Used Capacity</th>
            <th>Status</th>
          </tr>
        </thead>
      </table>
    `;
        searchResultsContainerElement.insertAdjacentHTML('beforeend', sunrise.getSearchResultsPagerHtml(Math.trunc(Number(limitElement.value)), responseJSON.offset, responseJSON.count));
        searchResultsContainerElement
            .querySelector('table')
            ?.append(resultsTbodyElement);
        searchResultsContainerElement
            .querySelector("button[data-page='previous']")
            ?.addEventListener('click', previousAndGetBurialSites);
        searchResultsContainerElement
            .querySelector("button[data-page='next']")
            ?.addEventListener('click', nextAndGetBurialSites);
    }
    function getBurialSites() {
        searchResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHtml('Loading Burial Sites...');
        cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doSearchBurialSites`, searchFilterFormElement, renderBurialSites);
    }
    function resetOffsetAndGetBurialSites() {
        offsetElement.value = '0';
        getBurialSites();
    }
    function previousAndGetBurialSites() {
        offsetElement.value = Math.max(Math.trunc(Number(offsetElement.value)) -
            Math.trunc(Number(limitElement.value)), 0).toString();
        getBurialSites();
    }
    function nextAndGetBurialSites() {
        offsetElement.value = (Math.trunc(Number(offsetElement.value)) +
            Math.trunc(Number(limitElement.value))).toString();
        getBurialSites();
    }
    const filterElements = searchFilterFormElement.querySelectorAll('input, select');
    for (const filterElement of filterElements) {
        filterElement.addEventListener('change', resetOffsetAndGetBurialSites);
    }
    searchFilterFormElement.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
    });
    getBurialSites();
}

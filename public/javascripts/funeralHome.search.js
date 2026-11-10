{
    const sunrise = exports.sunrise;
    const searchResultsContainerElement = document.querySelector('#container--searchResults');
    const funeralHomes = JSON.parse(searchResultsContainerElement.dataset.funeralHomes ?? '[]');
    const searchFilterElement = document.querySelector('#searchFilter--funeralHome');
    const hasUpcomingFuneralsFilterElement = document.querySelector('#searchFilter--hasUpcomingFunerals');
    function buildFuneralHomeAddressHTML(funeralHome) {
        let addressHTML = '';
        if (funeralHome.funeralHomeAddress1 !== '') {
            addressHTML += `${cityssm.escapeHTML(funeralHome.funeralHomeAddress1)}<br />`;
        }
        if (funeralHome.funeralHomeAddress2 !== '') {
            addressHTML += `${cityssm.escapeHTML(funeralHome.funeralHomeAddress2)}<br />`;
        }
        if (funeralHome.funeralHomeCity !== '' ||
            funeralHome.funeralHomeProvince !== '') {
            addressHTML += `${cityssm.escapeHTML(funeralHome.funeralHomeCity)},
        ${cityssm.escapeHTML(funeralHome.funeralHomeProvince)}<br />`;
        }
        if (funeralHome.funeralHomePostalCode !== '') {
            addressHTML += cityssm.escapeHTML(funeralHome.funeralHomePostalCode);
        }
        return addressHTML;
    }
    function renderResults() {
        searchResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHTML(i18next.t('loading'));
        let searchResultCount = 0;
        const searchResultsTbodyElement = document.createElement('tbody');
        const filterStringSplit = searchFilterElement.value
            .trim()
            .toLowerCase()
            .split(' ');
        for (const funeralHome of funeralHomes) {
            if (hasUpcomingFuneralsFilterElement.checked &&
                (funeralHome.upcomingFuneralCount ?? 0) === 0) {
                continue;
            }
            const searchString = `${funeralHome.funeralHomeName} ${funeralHome.funeralHomeAddress1} ${funeralHome.funeralHomeAddress2}`.toLowerCase();
            let shouldShowRecord = true;
            for (const filterStringPiece of filterStringSplit) {
                if (!searchString.includes(filterStringPiece)) {
                    shouldShowRecord = false;
                    break;
                }
            }
            if (!shouldShowRecord) {
                continue;
            }
            searchResultCount += 1;
            const searchResultRowElement = document.createElement('tr');
            searchResultRowElement.insertAdjacentHTML('beforeend', `
          <td>
            <a class="has-text-weight-bold" href="${sunrise.getFuneralHomeUrl(funeralHome.funeralHomeId)}">
              ${cityssm.escapeHTML(funeralHome.funeralHomeName === ''
                ? '(No Name)'
                : funeralHome.funeralHomeName)}
            </a>
            ${funeralHome.isAvailableOnPortal
                ? `<span class="tag">
                    <span class="icon"><i class="fa-solid fa-cloud-arrow-up"></i></span>
                    <span>${cityssm.escapeHTML(i18next.t('isAvailableOnPortal'))}</span>
                  </span>`
                : ''}
          </td>
        `);
            searchResultRowElement.insertAdjacentHTML('beforeend', `
          <td>
            ${buildFuneralHomeAddressHTML(funeralHome)}
          </td>
        `);
            searchResultRowElement.insertAdjacentHTML('beforeend', `
          <td>
            ${cityssm.escapeHTML(funeralHome.funeralHomePhoneNumber)}
          </td>
        `);
            searchResultRowElement.insertAdjacentHTML('beforeend', `
          <td class="has-text-right">
            ${cityssm.escapeHTML((funeralHome.upcomingFuneralCount ?? 0).toString())}
          </td>
        `);
            searchResultsTbodyElement.append(searchResultRowElement);
        }
        searchResultsContainerElement.replaceChildren();
        if (searchResultCount === 0) {
            searchResultsContainerElement.innerHTML = `
        <div class="message is-info">
          <p class="message-body">${cityssm.escapeHTML(i18next.t('noResults'))}</p>
        </div>
      `;
        }
        else {
            const searchResultsTableElement = document.createElement('table');
            searchResultsTableElement.className =
                'table is-fullwidth is-striped is-hoverable has-sticky-header';
            searchResultsTableElement.innerHTML = `
        <thead>
          <tr>
            <th>${cityssm.escapeHTML(i18next.t('contracts.funeralHome'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('address'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('phoneNumber'))}</th>
            <th class="has-text-right">${cityssm.escapeHTML(i18next.t('contracts.upcomingServices'))}</th>
          </tr>
        </thead>
      `;
            searchResultsTableElement.append(searchResultsTbodyElement);
            searchResultsContainerElement.append(searchResultsTableElement);
        }
    }
    searchFilterElement.addEventListener('keyup', renderResults);
    hasUpcomingFuneralsFilterElement.addEventListener('change', renderResults);
    document
        .querySelector('#form--searchFilters')
        ?.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
        renderResults();
    });
    if (i18next.isInitialized) {
        renderResults();
    }
    else {
        i18next.on('initialized', renderResults);
    }
}

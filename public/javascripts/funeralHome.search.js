"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const funeralHomes = exports.funeralHomes;
    const searchFilterElement = document.querySelector('#searchFilter--funeralHome');
    const searchResultsContainerElement = document.querySelector('#container--searchResults');
    function renderResults() {
        // eslint-disable-next-line no-unsanitized/property
        searchResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHTML('Loading Funeral Homes...');
        let searchResultCount = 0;
        const searchResultsTbodyElement = document.createElement('tbody');
        const filterStringSplit = searchFilterElement.value
            .trim()
            .toLowerCase()
            .split(' ');
        for (const funeralHome of funeralHomes) {
            const searchString = `${funeralHome.funeralHomeName} ${funeralHome.funeralHomeAddress1} ${funeralHome.funeralHomeAddress2}`.toLowerCase();
            let showRecord = true;
            for (const filterStringPiece of filterStringSplit) {
                if (!searchString.includes(filterStringPiece)) {
                    showRecord = false;
                    break;
                }
            }
            if (!showRecord) {
                continue;
            }
            searchResultCount += 1;
            // eslint-disable-next-line no-unsanitized/method
            searchResultsTbodyElement.insertAdjacentHTML('beforeend', `<tr>
          <td>
            <a class="has-text-weight-bold" href="${sunrise.getFuneralHomeURL(funeralHome.funeralHomeId)}">
              ${cityssm.escapeHTML(funeralHome.funeralHomeName === ''
                ? '(No Name)'
                : funeralHome.funeralHomeName)}
            </a>
          </td><td>
            ${funeralHome.funeralHomeAddress1 === ''
                ? ''
                : `${cityssm.escapeHTML(funeralHome.funeralHomeAddress1)}<br />`}
            ${funeralHome.funeralHomeAddress2 === ''
                ? ''
                : `${cityssm.escapeHTML(funeralHome.funeralHomeAddress2)}<br />`}
            ${funeralHome.funeralHomeCity !== '' ||
                funeralHome.funeralHomeProvince !== ''
                ? `${cityssm.escapeHTML(funeralHome.funeralHomeCity)},
                    ${cityssm.escapeHTML(funeralHome.funeralHomeProvince)}<br />`
                : ''}
            ${funeralHome.funeralHomePostalCode === ''
                ? ''
                : cityssm.escapeHTML(funeralHome.funeralHomePostalCode)}
          </td><td>
            ${cityssm.escapeHTML(funeralHome.funeralHomePhoneNumber)}
          </td>
          </tr>`);
        }
        searchResultsContainerElement.innerHTML = '';
        if (searchResultCount === 0) {
            searchResultsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no funeral homes that meet the search criteria.</p>
        </div>`;
        }
        else {
            const searchResultsTableElement = document.createElement('table');
            searchResultsTableElement.className =
                'table is-fullwidth is-striped is-hoverable has-sticky-header';
            searchResultsTableElement.innerHTML = `<thead><tr>
        <th>Funeral Home</th>
        <th>Address</th>
        <th>Phone Number</th>
        </tr></thead>`;
            searchResultsTableElement.append(searchResultsTbodyElement);
            searchResultsContainerElement.append(searchResultsTableElement);
        }
    }
    searchFilterElement.addEventListener('keyup', renderResults);
    document
        .querySelector('#form--searchFilters')
        ?.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
        renderResults();
    });
    renderResults();
})();

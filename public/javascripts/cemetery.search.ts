import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { Cemetery } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: {
  sunrise: Sunrise

  cemeteries: Cemetery[]
}
;(() => {
  const sunrise = exports.sunrise

  const cemeteries = exports.cemeteries

  const searchFilterElement = document.querySelector(
    '#searchFilter--cemetery'
  ) as HTMLInputElement

  const searchResultsContainerElement = document.querySelector(
    '#container--searchResults'
  ) as HTMLElement

  function buildCemeteryAddressHTML(cemetery: Cemetery): string {
    let addressHTML = ''

    if (cemetery.cemeteryAddress1 !== '') {
      addressHTML += `${cityssm.escapeHTML(cemetery.cemeteryAddress1)}<br />`
    }

    if (cemetery.cemeteryAddress2 !== '') {
      addressHTML += `${cityssm.escapeHTML(cemetery.cemeteryAddress2)}<br />`
    }

    if (cemetery.cemeteryCity !== '' || cemetery.cemeteryProvince !== '') {
      addressHTML += /* html */ `
        <span class="is-size-7">
          ${cityssm.escapeHTML(cemetery.cemeteryCity)}, ${cityssm.escapeHTML(cemetery.cemeteryProvince)}
        </span>
      `
    }

    return addressHTML
  }

  function buildCemeteryFeaturesHTML(cemetery: Cemetery): string {
    let featuresHTML = ''

    if (cemetery.parentCemeteryId !== null) {
      featuresHTML += /* html */ `
        <span class="icon" title="Parent: ${cemetery.parentCemeteryName ?? '(No Name)'}">
          <i class="fa-solid fa-turn-up" role="img" aria-label="Has Parent Cemetery"></i>
        </span>
      `
    }

    if (
      typeof cemetery.cemeteryLatitude === 'number' &&
      typeof cemetery.cemeteryLongitude === 'number'
    ) {
      featuresHTML += /* html */ `
        <span class="icon" title="Geographic Coordinates">
          <i class="fa-solid fa-map-marker-alt" role="img" aria-label="Has Geographic Coordinates"></i>
        </span>
      `
    }

    if (cemetery.cemeterySvg !== '') {
      featuresHTML += /* html */ `
        <span class="icon" title="Image">
          <i class="fa-solid fa-image" role="img" aria-label="Has Image"></i>
        </span>
      `
    }

    return featuresHTML
  }

  function renderResults(): void {
    searchResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHTML(
      'Loading Cemeteries...'
    )

    let searchResultCount = 0
    const searchResultsTbodyElement = document.createElement('tbody')

    const filterStringSplit = searchFilterElement.value
      .trim()
      .toLowerCase()
      .split(' ')

    for (const cemetery of cemeteries) {
      const cemeterySearchString = [
        cemetery.cemeteryName,
        cemetery.cemeteryKey,
        cemetery.cemeteryDescription,
        cemetery.cemeteryAddress1,
        cemetery.cemeteryAddress2
      ]
        .join(' ')
        .toLowerCase()

      let showCemetery = true

      for (const filterStringPiece of filterStringSplit) {
        if (!cemeterySearchString.includes(filterStringPiece)) {
          showCemetery = false
          break
        }
      }

      if (!showCemetery) {
        continue
      }

      searchResultCount += 1

      // eslint-disable-next-line no-unsanitized/method
      searchResultsTbodyElement.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <tr style="page-break-inside: avoid;">
            <td>
              <a class="has-text-weight-bold" href="${sunrise.getCemeteryUrl(cemetery.cemeteryId)}">
                ${
                  cemetery.cemeteryName === ''
                    ? `(No Name) <span class="icon is-small has-text-danger">
                        <i class="fa-solid fa-exclamation-triangle"></i>
                        </span>`
                    : cityssm.escapeHTML(cemetery.cemeteryName)
                }
                ${
                  cemetery.cemeteryKey === ''
                    ? ''
                    : /* html */ `
                      <span class="tag">
                        ${cityssm.escapeHTML(cemetery.cemeteryKey)}
                      </span>
                    `
                }
              </a>
              <br />
              <span class="is-size-7">
                ${cityssm.escapeHTML(cemetery.cemeteryDescription)}
              </span>
            </td>
            <td>
              ${buildCemeteryAddressHTML(cemetery)}
            </td>
            <td>
              ${cityssm.escapeHTML(cemetery.cemeteryPhoneNumber)}
            </td>
            <td class="has-text-centered">
              ${buildCemeteryFeaturesHTML(cemetery)}
            </td>
            <td class="has-text-right">
              <a href="${sunrise.urlPrefix}/burialSites?cemeteryId=${cemetery.cemeteryId}">${cemetery.burialSiteCount}</a>
            </td>
          </tr>
        `
      )
    }

    searchResultsContainerElement.innerHTML = ''

    if (searchResultCount === 0) {
      searchResultsContainerElement.innerHTML = /* html */ `
        <div class="message is-info">
          <p class="message-body">There are no cemeteries that meet the search criteria.</p>
        </div>
      `
    } else {
      const searchResultsTableElement = document.createElement('table')

      searchResultsTableElement.className =
        'table is-fullwidth is-striped is-hoverable has-sticky-header'

      searchResultsTableElement.innerHTML = /* html */ `
        <thead>
          <tr>
            <th>Cemetery</th>
            <th>Address</th>
            <th>Phone Number</th>
            <th class="has-text-centered">Features</th>
            <th class="has-text-right">Burial Sites</th>
          </tr>
        </thead>
      `

      searchResultsTableElement.append(searchResultsTbodyElement)

      searchResultsContainerElement.append(searchResultsTableElement)
    }
  }

  searchFilterElement.addEventListener('keyup', renderResults)

  document
    .querySelector('#form--searchFilters')
    ?.addEventListener('submit', (formEvent) => {
      formEvent.preventDefault()
      renderResults()
    })

  renderResults()
})()

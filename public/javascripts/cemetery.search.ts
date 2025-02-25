import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Cemetery } from '../../types/recordTypes.js'

import type { LOS } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: Record<string, unknown>
;(() => {
  const los = exports.los as LOS

  const cemeteries = exports.cemeteries as Cemetery[]

  const searchFilterElement = document.querySelector(
    '#searchFilter--cemetery'
  ) as HTMLInputElement

  const searchResultsContainerElement = document.querySelector(
    '#container--searchResults'
  ) as HTMLElement

  // eslint-disable-next-line complexity
  function renderResults(): void {
    // eslint-disable-next-line no-unsanitized/property
    searchResultsContainerElement.innerHTML = los.getLoadingParagraphHTML(
      `Loading Cemeteries...`
    )

    let searchResultCount = 0
    const searchResultsTbodyElement = document.createElement('tbody')

    const filterStringSplit = searchFilterElement.value
      .trim()
      .toLowerCase()
      .split(' ')

    for (const cemetery of cemeteries) {
      const cemeterySearchString = `${cemetery.cemeteryName ?? ''} ${
        cemetery.cemeteryDescription ?? ''
      } ${cemetery.cemeteryAddress1 ?? ''} ${cemetery.cemeteryAddress2 ?? ''}`.toLowerCase()

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
        `<tr>
          <td>
            <a class="has-text-weight-bold" href="${los.getCemeteryURL(cemetery.cemeteryId)}">
              ${cityssm.escapeHTML(
                (cemetery.cemeteryName ?? '') === '' ? '(No Name)' : cemetery.cemeteryName ?? ''
              )}
            </a><br />
            <span class="is-size-7">
              ${cityssm.escapeHTML(cemetery.cemeteryDescription ?? '')}
            </span>
          </td><td>
            ${
              (cemetery.cemeteryAddress1 ?? '') === ''
                ? ''
                : `${cityssm.escapeHTML(cemetery.cemeteryAddress1 ?? '')}<br />`
            }
            ${
              (cemetery.cemeteryAddress2 ?? '') === ''
                ? ''
                : `${cityssm.escapeHTML(cemetery.cemeteryAddress2 ?? '')}<br />`
            }
            ${
              cemetery.cemeteryCity || cemetery.cemeteryProvince
                ? `${cityssm.escapeHTML(cemetery.cemeteryCity ?? '')}, ${cityssm.escapeHTML(cemetery.cemeteryProvince ?? '')}<br />`
                : ''
            }
            ${
              (cemetery.cemeteryPostalCode ?? '') === ''
                ? ''
                : cityssm.escapeHTML(cemetery.cemeteryPostalCode ?? '')
            }
          </td><td>
            ${cityssm.escapeHTML(cemetery.cemeteryPhoneNumber ?? '')}
          </td><td class="has-text-centered">
            ${
              cemetery.cemeteryLatitude && cemetery.cemeteryLongitude
                ? `<span data-tooltip="Has Geographic Coordinates">
                    <i class="fas fa-map-marker-alt" role="img" aria-label="Has Geographic Coordinates"></i>
                    </span>`
                : ''
            }
          </td><td class="has-text-centered">
            ${
              (cemetery.cemeterySvg ?? '') === ''
                ? ''
                : '<span data-tooltip="Has Image"><i class="fas fa-image" role="img" aria-label="Has Image"></i></span>'
            }
          </td><td class="has-text-right">
            <a href="${los.urlPrefix}/burialSites?cemeteryId=${cemetery.cemeteryId}">${cemetery.burialSiteCount}</a>
          </td>
          </tr>`
      )
    }

    searchResultsContainerElement.innerHTML = ''

    if (searchResultCount === 0) {
      // eslint-disable-next-line no-unsanitized/property
      searchResultsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no cemeteries that meet the search criteria.</p>
        </div>`
    } else {
      const searchResultsTableElement = document.createElement('table')

      searchResultsTableElement.className =
        'table is-fullwidth is-striped is-hoverable has-sticky-header'

      // eslint-disable-next-line no-unsanitized/property
      searchResultsTableElement.innerHTML = `<thead><tr>
        <th>Cemetery</th>
        <th>Address</th>
        <th>Phone Number</th>
        <th class="has-text-centered">Coordinates</th>
        <th class="has-text-centered">Image</th>
        <th class="has-text-right">Burial Site Count</th>
        </tr></thead>`

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

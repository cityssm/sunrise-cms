import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { LOS } from '../../types/globalTypes.js'
import type { MapRecord } from '../../types/recordTypes.js'

declare const cityssm: cityssmGlobal

declare const exports: Record<string, unknown>
;(() => {
  const los = exports.los as LOS

  const maps = exports.maps as MapRecord[]

  const searchFilterElement = document.querySelector(
    '#searchFilter--map'
  ) as HTMLInputElement

  const searchResultsContainerElement = document.querySelector(
    '#container--searchResults'
  ) as HTMLElement

  function renderResults(): void {
    // eslint-disable-next-line no-unsanitized/property
    searchResultsContainerElement.innerHTML = los.getLoadingParagraphHTML(
      `Loading ${los.escapedAliases.Maps}...`
    )

    let searchResultCount = 0
    const searchResultsTbodyElement = document.createElement('tbody')

    const filterStringSplit = searchFilterElement.value
      .trim()
      .toLowerCase()
      .split(' ')

    for (const map of maps) {
      const mapSearchString = `${map.cemeteryName ?? ''} ${
        map.mapDescription ?? ''
      } ${map.mapAddress1 ?? ''} ${map.mapAddress2 ?? ''}`.toLowerCase()

      let showMap = true

      for (const filterStringPiece of filterStringSplit) {
        if (!mapSearchString.includes(filterStringPiece)) {
          showMap = false
          break
        }
      }

      if (!showMap) {
        continue
      }

      searchResultCount += 1

      // eslint-disable-next-line no-unsanitized/method
      searchResultsTbodyElement.insertAdjacentHTML(
        'beforeend',
        `<tr>
          <td>
            <a class="has-text-weight-bold" href="${los.getMapURL(map.cemeteryId)}">
              ${cityssm.escapeHTML(
                (map.cemeteryName ?? '') === '' ? '(No Name)' : map.cemeteryName ?? ''
              )}
            </a><br />
            <span class="is-size-7">
              ${cityssm.escapeHTML(map.mapDescription ?? '')}
            </span>
          </td><td>
            ${
              (map.mapAddress1 ?? '') === ''
                ? ''
                : `${cityssm.escapeHTML(map.mapAddress1 ?? '')}<br />`
            }
            ${
              (map.mapAddress2 ?? '') === ''
                ? ''
                : `${cityssm.escapeHTML(map.mapAddress2 ?? '')}<br />`
            }
            ${
              map.mapCity || map.mapProvince
                ? `${cityssm.escapeHTML(map.mapCity ?? '')}, ${cityssm.escapeHTML(map.mapProvince ?? '')}<br />`
                : ''
            }
            ${
              (map.mapPostalCode ?? '') === ''
                ? ''
                : cityssm.escapeHTML(map.mapPostalCode ?? '')
            }
          </td><td>
            ${cityssm.escapeHTML(map.mapPhoneNumber ?? '')}
          </td><td class="has-text-centered">
            ${
              map.mapLatitude && map.mapLongitude
                ? `<span data-tooltip="Has Geographic Coordinates">
                    <i class="fas fa-map-marker-alt" role="img" aria-label="Has Geographic Coordinates"></i>
                    </span>`
                : ''
            }
          </td><td class="has-text-centered">
            ${
              (map.mapSVG ?? '') === ''
                ? ''
                : '<span data-tooltip="Has Image"><i class="fas fa-image" role="img" aria-label="Has Image"></i></span>'
            }
          </td><td class="has-text-right">
            <a href="${los.urlPrefix}/lots?cemeteryId=${map.cemeteryId}">${map.lotCount}</a>
          </td>
          </tr>`
      )
    }

    searchResultsContainerElement.innerHTML = ''

    if (searchResultCount === 0) {
      // eslint-disable-next-line no-unsanitized/property
      searchResultsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no ${los.escapedAliases.maps} that meet the search criteria.</p>
        </div>`
    } else {
      const searchResultsTableElement = document.createElement('table')

      searchResultsTableElement.className =
        'table is-fullwidth is-striped is-hoverable has-sticky-header'

      // eslint-disable-next-line no-unsanitized/property
      searchResultsTableElement.innerHTML = `<thead><tr>
        <th>${los.escapedAliases.Map}</th>
        <th>Address</th>
        <th>Phone Number</th>
        <th class="has-text-centered">Coordinates</th>
        <th class="has-text-centered">Image</th>
        <th class="has-text-right">${los.escapedAliases.Lot} Count</th>
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

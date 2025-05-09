import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Cemetery } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: Record<string, unknown>
;(() => {
  const sunrise = exports.sunrise as Sunrise

  const cemeteries = exports.cemeteries as Cemetery[]

  const searchFilterElement = document.querySelector(
    '#searchFilter--cemetery'
  ) as HTMLInputElement

  const searchResultsContainerElement = document.querySelector(
    '#container--searchResults'
  ) as HTMLElement

  function renderResults(): void {
    // eslint-disable-next-line no-unsanitized/property
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
        `<tr style="page-break-inside: avoid;">
          <td>
            <a class="has-text-weight-bold" href="${sunrise.getCemeteryURL(cemetery.cemeteryId)}">
              ${cityssm.escapeHTML(
                cemetery.cemeteryName === ''
                  ? '(No Name)'
                  : cemetery.cemeteryName
              )}
              ${
                cemetery.cemeteryName === ''
                  ? `<span class="icon is-small has-text-danger">
                      <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                      </span>`
                  : ''
              }
              ${
                cemetery.cemeteryKey === ''
                  ? ''
                  : `<span class="tag">${cityssm.escapeHTML(cemetery.cemeteryKey)}</span>`
              }
            </a>
            <br />
            <span class="is-size-7">
              ${cityssm.escapeHTML(cemetery.cemeteryDescription)}
            </span>
          </td><td>
            ${
              cemetery.cemeteryAddress1 === ''
                ? ''
                : `${cityssm.escapeHTML(cemetery.cemeteryAddress1)}<br />`
            }
            ${
              cemetery.cemeteryAddress2 === ''
                ? ''
                : `${cityssm.escapeHTML(cemetery.cemeteryAddress2)}<br />`
            }
            ${
              cemetery.cemeteryCity !== '' || cemetery.cemeteryProvince !== ''
                ? `<span class="is-size-7">
                    ${cityssm.escapeHTML(cemetery.cemeteryCity)}, ${cityssm.escapeHTML(cemetery.cemeteryProvince)}
                    </span>`
                : ''
            }
          </td><td>
            ${cityssm.escapeHTML(cemetery.cemeteryPhoneNumber)}
          </td><td class="has-text-centered">
            ${
              cemetery.parentCemeteryId === null
                ? ''
                : `<span class="icon" data-tooltip="Parent: ${cemetery.parentCemeteryName ?? '(No Name)'}">
                    <i class="fas fa-turn-up" role="img" aria-label="Parent: ${cemetery.parentCemeteryName ?? '(No Name)'}"></i>
                    </span>`
            }
            ${
              cemetery.cemeteryLatitude && cemetery.cemeteryLongitude
                ? `<span class="icon" data-tooltip="Geographic Coordinates">
                    <i class="fas fa-map-marker-alt" role="img" aria-label="Geographic Coordinates"></i>
                    </span>`
                : ''
            }
            ${
              (cemetery.cemeterySvg ?? '') === ''
                ? ''
                : `<span class="icon" data-tooltip="Image">
                    <i class="fas fa-image" role="img" aria-label="Image"></i>
                    </span>`
            }
          </td><td class="has-text-right">
            <a href="${sunrise.urlPrefix}/burialSites?cemeteryId=${cemetery.cemeteryId}">${cemetery.burialSiteCount}</a>
          </td>
          </tr>`
      )
    }

    searchResultsContainerElement.innerHTML = ''

    if (searchResultCount === 0) {
      searchResultsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no cemeteries that meet the search criteria.</p>
        </div>`
    } else {
      const searchResultsTableElement = document.createElement('table')

      searchResultsTableElement.className =
        'table is-fullwidth is-striped is-hoverable has-sticky-header'

      searchResultsTableElement.innerHTML = `<thead><tr>
        <th>Cemetery</th>
        <th>Address</th>
        <th>Phone Number</th>
        <th class="has-text-centered">Features</th>
        <th class="has-text-right">Burial Sites</th>
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

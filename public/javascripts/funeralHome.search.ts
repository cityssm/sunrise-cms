import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { FuneralHome } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: {
  sunrise: Sunrise

  funeralHomes: FuneralHome[]
}
;(() => {
  const sunrise = exports.sunrise

  const funeralHomes = exports.funeralHomes

  const searchFilterElement = document.querySelector(
    '#searchFilter--funeralHome'
  ) as HTMLInputElement

  const hasUpcomingFuneralsFilterElement = document.querySelector(
    '#searchFilter--hasUpcomingFunerals'
  ) as HTMLInputElement

  const searchResultsContainerElement = document.querySelector(
    '#container--searchResults'
  ) as HTMLElement

  function buildFuneralHomeAddressHTML(funeralHome: FuneralHome): string {
    let addressHTML = ''

    if (funeralHome.funeralHomeAddress1 !== '') {
      addressHTML += `${cityssm.escapeHTML(funeralHome.funeralHomeAddress1)}<br />`
    }

    if (funeralHome.funeralHomeAddress2 !== '') {
      addressHTML += `${cityssm.escapeHTML(funeralHome.funeralHomeAddress2)}<br />`
    }

    if (
      funeralHome.funeralHomeCity !== '' ||
      funeralHome.funeralHomeProvince !== ''
    ) {
      addressHTML += `${cityssm.escapeHTML(funeralHome.funeralHomeCity)},
        ${cityssm.escapeHTML(funeralHome.funeralHomeProvince)}<br />`
    }

    if (funeralHome.funeralHomePostalCode !== '') {
      addressHTML += cityssm.escapeHTML(funeralHome.funeralHomePostalCode)
    }

    return addressHTML
  }

  function renderResults(): void {
    searchResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHTML(
      'Loading Funeral Homes...'
    )

    let searchResultCount = 0
    const searchResultsTbodyElement = document.createElement('tbody')

    const filterStringSplit = searchFilterElement.value
      .trim()
      .toLowerCase()
      .split(' ')

    for (const funeralHome of funeralHomes) {
      if (
        hasUpcomingFuneralsFilterElement.checked &&
        (funeralHome.upcomingFuneralCount ?? 0) === 0
      ) {
        continue
      }

      const searchString =
        `${funeralHome.funeralHomeName} ${funeralHome.funeralHomeAddress1} ${funeralHome.funeralHomeAddress2}`.toLowerCase()

      let showRecord = true

      for (const filterStringPiece of filterStringSplit) {
        if (!searchString.includes(filterStringPiece)) {
          showRecord = false
          break
        }
      }

      if (!showRecord) {
        continue
      }

      searchResultCount += 1

      searchResultsTbodyElement.insertAdjacentHTML(
        'beforeend',
        /*html*/ `
          <tr>
            <td>
              <a class="has-text-weight-bold" href="${sunrise.getFuneralHomeUrl(funeralHome.funeralHomeId)}">
                ${cityssm.escapeHTML(
                  funeralHome.funeralHomeName === ''
                    ? '(No Name)'
                    : funeralHome.funeralHomeName
                )}
              </a>
            </td>
            <td>
              ${buildFuneralHomeAddressHTML(funeralHome)}
            </td>
            <td>
              ${cityssm.escapeHTML(funeralHome.funeralHomePhoneNumber)}
            </td>
            <td class="has-text-right">
              ${cityssm.escapeHTML((funeralHome.upcomingFuneralCount ?? 0).toString())}
            </td>
          </tr>
        `
      )
    }

    searchResultsContainerElement.innerHTML = ''

    if (searchResultCount === 0) {
      searchResultsContainerElement.innerHTML = /*html*/ `
        <div class="message is-info">
          <p class="message-body">There are no funeral homes that meet the search criteria.</p>
        </div>
      `
    } else {
      const searchResultsTableElement = document.createElement('table')

      searchResultsTableElement.className =
        'table is-fullwidth is-striped is-hoverable has-sticky-header'

      searchResultsTableElement.innerHTML = /*html*/ `
        <thead>
          <tr>
            <th>Funeral Home</th>
            <th>Address</th>
            <th>Phone Number</th>
            <th class="has-text-right">Upcoming Funerals</th>
          </tr>
        </thead>
      `

      searchResultsTableElement.append(searchResultsTbodyElement)

      searchResultsContainerElement.append(searchResultsTableElement)
    }
  }

  searchFilterElement.addEventListener('keyup', renderResults)

  hasUpcomingFuneralsFilterElement.addEventListener('change', renderResults)

  document
    .querySelector('#form--searchFilters')
    ?.addEventListener('submit', (formEvent) => {
      formEvent.preventDefault()
      renderResults()
    })

  renderResults()
})()

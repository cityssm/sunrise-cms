import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { LOS } from '../../types/globalTypes.js'
import type { Lot } from '../../types/recordTypes.js'

declare const cityssm: cityssmGlobal

declare const exports: Record<string, unknown>
;(() => {
  const los = exports.los as LOS

  const searchFilterFormElement = document.querySelector(
    '#form--searchFilters'
  ) as HTMLFormElement

  const searchResultsContainerElement = document.querySelector(
    '#container--searchResults'
  ) as HTMLElement

  const limit = Number.parseInt(
    (document.querySelector('#searchFilter--limit') as HTMLInputElement).value,
    10
  )
  const offsetElement = document.querySelector(
    '#searchFilter--offset'
  ) as HTMLInputElement

  function renderLots(rawResponseJSON: unknown): void {
    const responseJSON = rawResponseJSON as {
      count: number
      offset: number
      lots: Lot[]
    }

    if (responseJSON.lots.length === 0) {
      // eslint-disable-next-line no-unsanitized/property
      searchResultsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no ${los.escapedAliases.lots} that meet the search criteria.</p>
        </div>`

      return
    }

    const resultsTbodyElement = document.createElement('tbody')

    for (const lot of responseJSON.lots) {
      // eslint-disable-next-line no-unsanitized/method
      resultsTbodyElement.insertAdjacentHTML(
        'beforeend',
        `<tr>
          <td>
            <a class="has-text-weight-bold" href="${los.getLotURL(lot.lotId)}">
              ${cityssm.escapeHTML(lot.lotName ?? '')}
            </a>
          </td><td>
            <a href="${los.getMapURL(lot.cemeteryId)}">
              ${
                lot.cemeteryName
                  ? cityssm.escapeHTML(lot.cemeteryName)
                  : '<span class="has-text-grey">(No Name)</span>'
              }
            </a>
          </td><td>
            ${cityssm.escapeHTML(lot.lotType ?? '')}
          </td><td>
            ${
              lot.burialSiteStatusId
                ? cityssm.escapeHTML(lot.lotStatus ?? '')
                : '<span class="has-text-grey">(No Status)</span>'
            }<br />
            ${
              (lot.burialSiteContractCount ?? 0) > 0
                ? '<span class="is-size-7">Currently Occupied</span>'
                : ''
            }
          </td>
          </tr>`
      )
    }

    // eslint-disable-next-line no-unsanitized/property
    searchResultsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
      <thead><tr>
      <th>${los.escapedAliases.Lot}</th>
      <th>${los.escapedAliases.Map}</th>
      <th>${los.escapedAliases.Lot} Type</th>
      <th>Status</th>
      </tr></thead>
      <table>`

    // eslint-disable-next-line no-unsanitized/method
    searchResultsContainerElement.insertAdjacentHTML(
      'beforeend',
      los.getSearchResultsPagerHTML(
        limit,
        responseJSON.offset,
        responseJSON.count
      )
    )

    searchResultsContainerElement
      .querySelector('table')
      ?.append(resultsTbodyElement)

    searchResultsContainerElement
      .querySelector("button[data-page='previous']")
      ?.addEventListener('click', previousAndGetLots)

    searchResultsContainerElement
      .querySelector("button[data-page='next']")
      ?.addEventListener('click', nextAndGetLots)
  }

  function getLots(): void {
    // eslint-disable-next-line no-unsanitized/property
    searchResultsContainerElement.innerHTML = los.getLoadingParagraphHTML(
      `Loading ${los.escapedAliases.Lots}...`
    )

    cityssm.postJSON(
      `${los.urlPrefix}/lots/doSearchLots`,
      searchFilterFormElement,
      renderLots
    )
  }

  function resetOffsetAndGetLots(): void {
    offsetElement.value = '0'
    getLots()
  }

  function previousAndGetLots(): void {
    offsetElement.value = Math.max(
      Number.parseInt(offsetElement.value, 10) - limit,
      0
    ).toString()
    getLots()
  }

  function nextAndGetLots(): void {
    offsetElement.value = (
      Number.parseInt(offsetElement.value, 10) + limit
    ).toString()
    getLots()
  }

  const filterElements =
    searchFilterFormElement.querySelectorAll('input, select')

  for (const filterElement of filterElements) {
    filterElement.addEventListener('change', resetOffsetAndGetLots)
  }

  searchFilterFormElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()
  })

  getLots()
})()

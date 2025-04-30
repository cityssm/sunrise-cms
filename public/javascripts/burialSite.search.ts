import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { BurialSite } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: Record<string, unknown>
;(() => {
  const sunrise = exports.sunrise as Sunrise

  const searchFilterFormElement = document.querySelector(
    '#form--searchFilters'
  ) as HTMLFormElement

  const searchResultsContainerElement = document.querySelector(
    '#container--searchResults'
  ) as HTMLElement

  const limitElement = document.querySelector(
    '#searchFilter--limit'
  ) as HTMLSelectElement

  const offsetElement = document.querySelector(
    '#searchFilter--offset'
  ) as HTMLInputElement

  function renderBurialSites(rawResponseJSON: unknown): void {
    const responseJSON = rawResponseJSON as {
      burialSites: BurialSite[]
      count: number
      offset: number
    }

    if (responseJSON.burialSites.length === 0) {
      searchResultsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no burial sites that meet the search criteria.</p>
        </div>`

      return
    }

    const resultsTbodyElement = document.createElement('tbody')

    for (const burialSite of responseJSON.burialSites) {
      const cemeteryNameHtml =
        burialSite.cemeteryName === ''
          ? '<span class="has-text-grey">(No Name)</span>'
          : cityssm.escapeHTML(burialSite.cemeteryName ?? '')

      // eslint-disable-next-line no-unsanitized/method
      resultsTbodyElement.insertAdjacentHTML(
        'beforeend',
        `<tr>
          <td>
            <a class="has-text-weight-bold" href="${sunrise.getBurialSiteURL(burialSite.burialSiteId)}">
              ${cityssm.escapeHTML(burialSite.burialSiteName ?? '')}
            </a>
          </td><td>
          ${
            burialSite.cemeteryId === null
              ? '<span class="has-text-grey">(No Cemetery)</span>'
              : `<a href="${sunrise.getCemeteryURL(burialSite.cemeteryId)}">
                  ${cemeteryNameHtml}
                  </a>`
          }
          </td><td>
            ${cityssm.escapeHTML(burialSite.burialSiteType ?? '')}
          </td><td>
            ${
              burialSite.burialSiteStatusId === null ||
              burialSite.burialSiteStatusId === undefined
                ? '<span class="has-text-grey">(No Status)</span>'
                : cityssm.escapeHTML(burialSite.burialSiteStatus ?? '')
            }<br />
            ${
              (burialSite.contractCount ?? 0) > 0
                ? '<span class="is-size-7">Has Current Contracts</span>'
                : ''
            }
          </td>
          </tr>`
      )
    }

    searchResultsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable has-sticky-header">
      <thead><tr>
      <th>Burial Site</th>
      <th>Cemetery</th>
      <th>Burial Site Type</th>
      <th>Status</th>
      </tr></thead>
      <table>`

    // eslint-disable-next-line no-unsanitized/method
    searchResultsContainerElement.insertAdjacentHTML(
      'beforeend',
      sunrise.getSearchResultsPagerHTML(
        Number.parseInt(limitElement.value, 10),
        responseJSON.offset,
        responseJSON.count
      )
    )

    searchResultsContainerElement
      .querySelector('table')
      ?.append(resultsTbodyElement)

    searchResultsContainerElement
      .querySelector("button[data-page='previous']")
      ?.addEventListener('click', previousAndGetBurialSites)

    searchResultsContainerElement
      .querySelector("button[data-page='next']")
      ?.addEventListener('click', nextAndGetBurialSites)
  }

  function getBurialSites(): void {
    // eslint-disable-next-line no-unsanitized/property
    searchResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHTML(
      'Loading Burial Sites...'
    )

    cityssm.postJSON(
      `${sunrise.urlPrefix}/burialSites/doSearchBurialSites`,
      searchFilterFormElement,
      renderBurialSites
    )
  }

  function resetOffsetAndGetBurialSites(): void {
    offsetElement.value = '0'
    getBurialSites()
  }

  function previousAndGetBurialSites(): void {
    offsetElement.value = Math.max(
      Number.parseInt(offsetElement.value, 10) -
        Number.parseInt(limitElement.value, 10),
      0
    ).toString()
    getBurialSites()
  }

  function nextAndGetBurialSites(): void {
    offsetElement.value = (
      Number.parseInt(offsetElement.value, 10) +
      Number.parseInt(limitElement.value, 10)
    ).toString()
    getBurialSites()
  }

  const filterElements =
    searchFilterFormElement.querySelectorAll('input, select')

  for (const filterElement of filterElements) {
    filterElement.addEventListener('change', resetOffsetAndGetBurialSites)
  }

  searchFilterFormElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()
  })

  getBurialSites()
})()

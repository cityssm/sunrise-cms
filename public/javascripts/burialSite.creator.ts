import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise
}

interface GetBurialSiteNamesByRangeResult {
  burialSiteNames: Array<{
    burialSiteId?: number
    burialSiteName: string
  }>
  cemeteryId: string
}

;(() => {
  const sunrise = exports.sunrise

  const newResultsCountElement = document.querySelector(
    '#burialSitePreview_newCount'
  ) as HTMLSpanElement

  const newResultsContainerElement = document.querySelector(
    '#container--burialSitePreview_new'
  ) as HTMLElement

  const existingResultsCountElement = document.querySelector(
    '#burialSitePreview_existingCount'
  ) as HTMLSpanElement

  const existingResultsContainerElement = document.querySelector(
    '#container--burialSitePreview_existing'
  ) as HTMLElement

  function renderBurialSiteNames(
    responseJSON: GetBurialSiteNamesByRangeResult
  ): void {}

  document
    .querySelector('#form--burialSiteCreator')
    ?.addEventListener('submit', (event) => {
      event.preventDefault()

      const formElement = event.currentTarget as HTMLFormElement

      ;(
        document.querySelector('#tab--burialSitePreview') as HTMLAnchorElement
      ).click()

      newResultsCountElement.innerHTML = '0'

      // eslint-disable-next-line no-unsanitized/property
      newResultsContainerElement.innerHTML = sunrise.getLoadingParagraphHTML(
        'Building burial sites...'
      )

      existingResultsCountElement.innerHTML = '0'
      existingResultsContainerElement.innerHTML = ''

      cityssm.postJSON(
        `${sunrise.urlPrefix}/burialSites/doGetBurialSiteNamesByRange`,
        formElement,
        (rawResponseJSON: unknown) => {
          const responseJSON =
            rawResponseJSON as GetBurialSiteNamesByRangeResult

          renderBurialSiteNames(responseJSON)
        }
      )
    })
})()

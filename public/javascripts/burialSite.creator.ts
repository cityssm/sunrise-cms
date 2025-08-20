import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise
  burialSiteNameSegments?: any
  cemeteries?: any[]
}

interface GetBurialSiteNamesByRangeResult {
  burialSiteNames: Array<{
    burialSiteId?: number
    burialSiteName: string
    burialSiteNameSegment1: string
    burialSiteNameSegment2: string
    burialSiteNameSegment3: string
    burialSiteNameSegment4: string
    burialSiteNameSegment5: string
  }>
  cemeteryId: string

  burialSiteNameRangeLimit: number
}

;(() => {
  const sunrise = exports.sunrise

  // Burial Site Name Preview
  const fromPreviewElement = document.querySelector('#burialSiteCreator--fromPreview') as HTMLInputElement
  const toPreviewElement = document.querySelector('#burialSiteCreator--toPreview') as HTMLInputElement
  const segmentConfig = exports.burialSiteNameSegments
  const cemeteries = exports.cemeteries || []

  if ((fromPreviewElement || toPreviewElement) && segmentConfig?.includeCemeteryKey) {
    function buildBurialSiteNamePreview(isFrom: boolean): string {
      const cemeteryId = (document.querySelector('#burialSiteCreator--cemeteryId') as HTMLSelectElement)?.value
      const cemetery = cemeteries.find(c => c.cemeteryId?.toString() === cemeteryId)
      const cemeteryKey = cemetery?.cemeteryKey

      const segmentPieces: string[] = []

      if (segmentConfig.includeCemeteryKey && cemeteryKey !== undefined && cemeteryKey !== '') {
        segmentPieces.push(cemeteryKey)
      }

      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      for (let segmentIndex = 1; segmentIndex <= 5; segmentIndex++) {
        const segmentIndexString = segmentIndex.toString()
        const segment = segmentConfig.segments?.[segmentIndexString]

        if (segment?.isAvailable ?? false) {
          const suffix = isFrom ? '_from' : '_to'
          const inputElement = document.querySelector(`#burialSiteCreator--burialSiteNameSegment${segmentIndexString}${suffix}`) as HTMLInputElement
          const segmentValue = inputElement?.value ?? ''

          if ((segment.isRequired ?? false) || segmentValue !== '') {
            segmentPieces.push(
              (segment.prefix ?? '') +
              segmentValue +
              (segment.suffix ?? '')
            )
          }
        }
      }

      return segmentPieces.join(segmentConfig.separator ?? '-')
    }

    function updatePreviews(): void {
      if (fromPreviewElement) {
        fromPreviewElement.value = buildBurialSiteNamePreview(true)
      }
      if (toPreviewElement) {
        toPreviewElement.value = buildBurialSiteNamePreview(false)
      }
    }

    // Update previews when segment fields change
    for (let segmentIndex = 1; segmentIndex <= 5; segmentIndex++) {
      const fromInput = document.querySelector(`#burialSiteCreator--burialSiteNameSegment${segmentIndex}_from`) as HTMLInputElement
      const toInput = document.querySelector(`#burialSiteCreator--burialSiteNameSegment${segmentIndex}_to`) as HTMLInputElement
      
      if (fromInput) {
        fromInput.addEventListener('input', updatePreviews)
      }
      if (toInput) {
        toInput.addEventListener('input', updatePreviews)
      }
    }

    // Update previews when cemetery changes
    const cemeterySelect = document.querySelector('#burialSiteCreator--cemeteryId') as HTMLSelectElement
    if (cemeterySelect) {
      cemeterySelect.addEventListener('change', updatePreviews)
    }

    // Initial preview update
    updatePreviews()
  }

  const newResultsPanelElement = document.querySelector(
    '#panel--burialSitePreview_new'
  ) as HTMLDivElement

  const existingResultsPanelElement = document.querySelector(
    '#panel--burialSitePreview_existing'
  ) as HTMLDivElement

  const burialSiteElementSelector = '.panel-block.is-burial-site-block'
  const countElementSelector = '.panel-heading .tag'

  function updateCountElements(): void {
    const newResultsCountElement = newResultsPanelElement.querySelector(
      countElementSelector
    ) as HTMLSpanElement
    const existingResultsCountElement =
      existingResultsPanelElement.querySelector(
        countElementSelector
      ) as HTMLSpanElement

    // eslint-disable-next-line no-unsanitized/property
    newResultsCountElement.innerHTML = newResultsPanelElement
      .querySelectorAll(burialSiteElementSelector)
      .length.toString()

    // eslint-disable-next-line no-unsanitized/property
    existingResultsCountElement.innerHTML = existingResultsPanelElement
      .querySelectorAll(burialSiteElementSelector)
      .length.toString()
  }

  function clearPanel(panelElement: HTMLDivElement): void {
    const panelBlockElements = panelElement.querySelectorAll(
      burialSiteElementSelector
    )

    for (const panelBlockElement of panelBlockElements) {
      panelBlockElement.remove()
    }
  }

  function buildExistingBurialSitePanelBlockElement(
    burialSiteName: string,
    burialSiteId: number
  ): HTMLDivElement {
    const panelBlockElement = document.createElement('div')
    panelBlockElement.className = 'panel-block is-burial-site-block'

    // eslint-disable-next-line no-unsanitized/property
    panelBlockElement.innerHTML = `<div class="columns is-vcentered is-mobile">
      <div class="column is-narrow">
        <a class="button is-small is-primary" data-tooltip="View Burial Site"
          href="${sunrise.urlPrefix}/burialSites/${burialSiteId}" target="_blank">
          <span class="icon"><i class="fa-solid fa-eye"></i></span>
        </a>
      </div>
      <div class="column">
        ${cityssm.escapeHTML(burialSiteName)}
      </div>
      </div>`

    return panelBlockElement
  }

  function createBurialSite(clickEvent: Event): void {
    const buttonElement = clickEvent.currentTarget as HTMLButtonElement

    const burialSiteTypeId = (
      document.querySelector(
        '#burialSitePreview--burialSiteTypeId'
      ) as HTMLSelectElement
    ).value

    if (burialSiteTypeId === '') {
      bulmaJS.alert({
        contextualColorName: 'warning',
        title: 'Burial Site Type Required',

        message: 'Please select a burial site type.'
      })
      return
    }

    const burialSiteStatusId = (
      document.querySelector(
        '#burialSitePreview--burialSiteStatusId'
      ) as HTMLSelectElement
    ).value

    if (burialSiteStatusId === '') {
      bulmaJS.alert({
        contextualColorName: 'warning',
        title: 'Burial Site Status Required',

        message: 'Please select a burial site status.'
      })
      return
    }

    buttonElement.disabled = true
    buttonElement.classList.add('is-loading')

    const panelBlockElement = buttonElement.closest(
      burialSiteElementSelector
    ) as HTMLDivElement

    const cemeteryId = panelBlockElement.dataset.cemeteryId as string

    const burialSiteNameSegment1 = panelBlockElement.dataset
      .burialSiteNameSegment1 as string
    const burialSiteNameSegment2 = panelBlockElement.dataset
      .burialSiteNameSegment2 as string
    const burialSiteNameSegment3 = panelBlockElement.dataset
      .burialSiteNameSegment3 as string
    const burialSiteNameSegment4 = panelBlockElement.dataset
      .burialSiteNameSegment4 as string
    const burialSiteNameSegment5 = panelBlockElement.dataset
      .burialSiteNameSegment5 as string

    cityssm.postJSON(
      `${sunrise.urlPrefix}/burialSites/doCreateBurialSite`,
      {
        cemeteryId,

        burialSiteNameSegment1,
        burialSiteNameSegment2,
        burialSiteNameSegment3,
        burialSiteNameSegment4,
        burialSiteNameSegment5,

        burialSiteStatusId,
        burialSiteTypeId
      },
      (rawResponseJSON: unknown) => {
        const responseJSON = rawResponseJSON as {
          success: boolean

          burialSiteId?: number
          burialSiteName?: string

          errorMessage?: string
        }

        if (responseJSON.success) {
          panelBlockElement.remove()

          const newPanelBlockElement = buildExistingBurialSitePanelBlockElement(
            responseJSON.burialSiteName as string,
            responseJSON.burialSiteId as number
          )

          existingResultsPanelElement
            .querySelector('.panel-block')
            ?.insertAdjacentElement('afterend', newPanelBlockElement)

          updateCountElements()
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Creating Burial Site',

            message: responseJSON.errorMessage ?? 'Unknown error.'
          })

          buttonElement.disabled = false
          buttonElement.classList.remove('is-loading')
        }
      }
    )
  }

  function renderBurialSiteNames(
    responseJSON: GetBurialSiteNamesByRangeResult
  ): void {
    clearPanel(newResultsPanelElement)
    clearPanel(existingResultsPanelElement)

    for (const burialSiteName of responseJSON.burialSiteNames) {
      if (burialSiteName.burialSiteId === undefined) {
        const panelBlockElement = document.createElement('div')

        panelBlockElement.className = 'panel-block is-burial-site-block'

        panelBlockElement.dataset.cemeteryId = responseJSON.cemeteryId
        panelBlockElement.dataset.burialSiteName = burialSiteName.burialSiteName

        panelBlockElement.dataset.burialSiteNameSegment1 =
          burialSiteName.burialSiteNameSegment1
        panelBlockElement.dataset.burialSiteNameSegment2 =
          burialSiteName.burialSiteNameSegment2
        panelBlockElement.dataset.burialSiteNameSegment3 =
          burialSiteName.burialSiteNameSegment3
        panelBlockElement.dataset.burialSiteNameSegment4 =
          burialSiteName.burialSiteNameSegment4
        panelBlockElement.dataset.burialSiteNameSegment5 =
          burialSiteName.burialSiteNameSegment5

        panelBlockElement.innerHTML = `<div class="columns is-vcentered is-mobile">
          <div class="column is-narrow">
            <button class="button is-small is-success" data-tooltip="Create Burial Site" type="button">
              <span class="icon"><i class="fa-solid fa-plus"></i></span>
            </button>
          </div>
          <div class="column">
            ${cityssm.escapeHTML(burialSiteName.burialSiteName)}
          </div>
          </div>`

        panelBlockElement
          .querySelector('button')
          ?.addEventListener('click', createBurialSite)

        newResultsPanelElement.append(panelBlockElement)
      } else {
        existingResultsPanelElement.append(
          buildExistingBurialSitePanelBlockElement(
            burialSiteName.burialSiteName,
            burialSiteName.burialSiteId
          )
        )
      }
    }

    if (responseJSON.burialSiteNames.length === 0) {
      bulmaJS.alert({
        contextualColorName: 'info',
        title: 'No Burial Site Names Generated',

        message: `No burial site names were generated for the selected range.
          Note that ranges may not generate more than ${responseJSON.burialSiteNameRangeLimit} names.`
      })
    }

    updateCountElements()
  }

  document
    .querySelector('#form--burialSiteCreator')
    ?.addEventListener('submit', (event) => {
      event.preventDefault()

      const formElement = event.currentTarget as HTMLFormElement

      clearPanel(newResultsPanelElement)
      clearPanel(existingResultsPanelElement)
      updateCountElements()
      ;(
        document.querySelector('#tab--burialSitePreview') as HTMLAnchorElement
      ).click()

      cityssm.postJSON(
        `${sunrise.urlPrefix}/burialSites/doGetBurialSiteNamesByRange`,
        formElement,
        (rawResponseJSON: unknown) => {
          renderBurialSiteNames(
            rawResponseJSON as GetBurialSiteNamesByRangeResult
          )
        }
      )
    })
})()

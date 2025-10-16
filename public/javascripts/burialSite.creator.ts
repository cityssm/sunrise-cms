import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

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

    panelBlockElement.innerHTML = /*html*/ `
      <div class="columns is-vcentered is-mobile">
        <div class="column is-narrow">
          <a
            class="button is-small is-primary"
            href="${sunrise.getBurialSiteUrl(burialSiteId)}"
            title="View Burial Site"
            target="_blank"
          >
            <span class="icon"><i class="fa-solid fa-eye"></i></span>
          </a>
        </div>
        <div class="column">
          ${cityssm.escapeHTML(burialSiteName)}
        </div>
      </div>
    `

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

        panelBlockElement.innerHTML = /*html*/ `
          <div class="columns is-vcentered is-mobile">
            <div class="column is-narrow">
              <button class="button is-small is-success" type="button" title="Create Burial Site">
                <span class="icon"><i class="fa-solid fa-plus"></i></span>
              </button>
            </div>
            <div class="column">
              ${cityssm.escapeHTML(burialSiteName.burialSiteName)}
            </div>
          </div>
        `

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

  // Cemetery Key Preview

  const cemeteryKeyFromSpanElement = document.querySelector(
    '#burialSiteCreator--cemeteryKey_from'
  )

  if (cemeteryKeyFromSpanElement !== null) {
    const cemeteryKeyToSpanElement = document.querySelector(
      '#burialSiteCreator--cemeteryKey_to'
    ) as HTMLSpanElement

    document
      .querySelector('#burialSiteCreator--cemeteryId')
      ?.addEventListener('change', (changeEvent) => {
        const cemeterySelectElement =
          changeEvent.currentTarget as HTMLSelectElement

        const cemeteryKey =
          cemeterySelectElement.selectedOptions[0].dataset.cemeteryKey ?? ''

        cemeteryKeyFromSpanElement.innerHTML = cityssm.escapeHTML(cemeteryKey)
        cemeteryKeyToSpanElement.innerHTML = cityssm.escapeHTML(cemeteryKey)
      })
  }
})()

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'
import type { Options as BulmaCalendarOptions } from 'bulma-calendar'

import type { LOS } from './types.js'

type RandomColorHue =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'monochrome'
type RandomColorLuminosity = 'bright' | 'light' | 'dark'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const exports: Record<string, unknown> & {
  aliases: Record<string, string>
  randomColor: (options?: {
    hue?: RandomColorHue
    luminosity?: RandomColorLuminosity
    count?: number
    seed?: number | string
    format?: 'rgb' | 'rgba' | 'rgbArray' | 'hsl' | 'hsla' | 'hslArray' | 'hex'
    alpha?: number
  }) => string
}
;(() => {
  /*
   * Unsaved Changes
   */

  let _hasUnsavedChanges = false

  function setUnsavedChanges(): void {
    if (!hasUnsavedChanges()) {
      _hasUnsavedChanges = true
      cityssm.enableNavBlocker()
    }
  }

  function clearUnsavedChanges(): void {
    _hasUnsavedChanges = false
    cityssm.disableNavBlocker()
  }

  function hasUnsavedChanges(): boolean {
    return _hasUnsavedChanges
  }

  /*
   * Mapping
   */

  function highlightMap(
    mapContainerElement: HTMLElement,
    mapKey: string,
    contextualClass: 'success' | 'danger'
  ): void {
    // Search for ID
    let svgId = mapKey
    let svgElementToHighlight: SVGElement | null = null

    while (svgId !== '') {
      svgElementToHighlight = mapContainerElement.querySelector(`#${svgId}`)

      if (svgElementToHighlight !== null || !svgId.includes('-')) {
        break
      }

      svgId = svgId.slice(0, Math.max(0, svgId.lastIndexOf('-')))
    }

    if (svgElementToHighlight !== null) {
      svgElementToHighlight.style.fill = ''

      svgElementToHighlight.classList.add('highlight', `is-${contextualClass}`)

      const childPathElements = svgElementToHighlight.querySelectorAll('path')
      for (const pathElement of childPathElements) {
        pathElement.style.fill = ''
      }
    }
  }

  function unlockField(clickEvent: Event): void {
    const fieldElement = (clickEvent.currentTarget as HTMLElement).closest(
      '.field'
    ) as HTMLElement

    const inputOrSelectElement = fieldElement.querySelector(
      'input, select'
    ) as HTMLElement

    inputOrSelectElement.classList.remove('is-readonly')

    if (inputOrSelectElement.tagName === 'INPUT') {
      ;(inputOrSelectElement as HTMLInputElement).readOnly = false
      ;(inputOrSelectElement as HTMLInputElement).disabled = false
    } else {
      const optionElements = inputOrSelectElement.querySelectorAll('option')
      for (const optionElement of optionElements) {
        optionElement.disabled = false
      }
    }

    inputOrSelectElement.focus()
  }

  function initializeUnlockFieldButtons(containerElement: HTMLElement): void {
    const unlockFieldButtonElements = containerElement.querySelectorAll(
      '.is-unlock-field-button'
    )

    for (const unlockFieldButtonElement of unlockFieldButtonElements) {
      unlockFieldButtonElement.addEventListener('click', unlockField)
    }
  }

  /*
   * Date Pickers
   */

  const datePickerBaseOptions: BulmaCalendarOptions = {
    type: 'date',
    dateFormat: 'yyyy-MM-dd',
    showFooter: false,
    color: 'info',
    displayMode: 'dialog'
  }

  function initializeDatePickers(containerElement: HTMLElement): void {
    const dateElements: NodeListOf<HTMLInputElement> =
      containerElement.querySelectorAll("input[type='date']")

    for (const dateElement of dateElements) {
      const datePickerOptions = { ...datePickerBaseOptions }

      if (dateElement.required) {
        datePickerOptions.showClearButton = false
      }

      // apply min date if set
      if (dateElement.min !== '') {
        datePickerOptions.minDate = cityssm.dateStringToDate(dateElement.min)
      }

      // apply max date if set
      if (dateElement.max !== '') {
        datePickerOptions.maxDate = cityssm.dateStringToDate(dateElement.max)
      }

      const cal = exports.bulmaCalendar.attach(
        dateElement,
        datePickerOptions
      )[0]

      // trigger change event on original element
      cal.on('save', () => {
        dateElement.value = cal.value()
        dateElement.dispatchEvent(new Event('change'))
      })

      // Disable html scrolling when calendar is open
      cal.on('show', () => {
        document.querySelector('html')?.classList.add('is-clipped')
      })

      // Reenable scrolling, if a modal window is not open
      cal.on('hide', () => {
        bulmaJS.toggleHtmlClipped()
      })

      // Get the datepicker container element
      const datepickerElement = containerElement.querySelector(
        `#${cal._id as string}`
      ) as HTMLElement

      // Override the previous and next month button styles
      const datePickerNavButtonElements = datepickerElement.querySelectorAll(
        '.datepicker-nav button.is-text'
      )

      for (const datePickerNavButtonElement of datePickerNavButtonElements) {
        datePickerNavButtonElement.classList.add(
          `is-${datePickerBaseOptions.color ?? ''}`
        )
        datePickerNavButtonElement.classList.remove('is-text')
      }

      // Override the clear button style
      const clearButtonElement: HTMLElement | null =
        datepickerElement.querySelector('.datetimepicker-clear-button')

      if (clearButtonElement !== null) {
        if (dateElement.required) {
          clearButtonElement.remove()
        } else {
          clearButtonElement.dataset.tooltip = 'Clear'
          clearButtonElement.setAttribute('aria-label', 'Clear')
          clearButtonElement.innerHTML =
            '<span class="has-text-weight-bold" aria-hidden="true">&times;</span>'
        }
      }

      // Apply a label
      const labelElement = document.querySelector(
        `label[for='${dateElement.id}']`
      )

      if (labelElement !== null) {
        datepickerElement
          .querySelector('.datetimepicker-dummy-input')
          ?.setAttribute('aria-label', labelElement.textContent ?? '')
      }
    }
  }

  /*
   * Aliases
   */

  function populateAliases(containerElement: HTMLElement): void {
    const aliasElements: NodeListOf<HTMLElement> =
      containerElement.querySelectorAll('.alias')

    for (const aliasElement of aliasElements) {
      if (aliasElement.dataset.alias === 'ExternalReceiptNumber') {
        aliasElement.textContent = exports.aliases.externalReceiptNumber
        break
      }
    }
  }

  const escapedAliases = Object.freeze({
    ExternalReceiptNumber: cityssm.escapeHTML(
      exports.aliases.externalReceiptNumber
    ),
    externalReceiptNumber: cityssm.escapeHTML(
      exports.aliases.externalReceiptNumber.toLowerCase()
    ),

    WorkOrderOpenDate: cityssm.escapeHTML(exports.aliases.workOrderOpenDate),
    workOrderOpenDate: cityssm.escapeHTML(
      exports.aliases.workOrderOpenDate.toLowerCase()
    ),

    WorkOrderCloseDate: cityssm.escapeHTML(exports.aliases.workOrderCloseDate),
    workOrderCloseDate: cityssm.escapeHTML(
      exports.aliases.workOrderCloseDate.toLowerCase()
    )
  })

  /*
   * Colours
   */

  const hues = [
    'red',
    'green',
    'orange',
    'blue',
    'pink',
    'yellow',
    'purple'
  ] as RandomColorHue[]
  const luminosity = ['bright', 'light', 'dark'] as RandomColorLuminosity[]

  function getRandomColor(seedString: string): string {
    let actualSeedString = seedString

    if (actualSeedString.length < 2) {
      actualSeedString += 'a1'
    }

    return exports.randomColor({
      seed: actualSeedString + actualSeedString,
      hue: hues[
        (actualSeedString.codePointAt(actualSeedString.length - 1) as number) %
          hues.length
      ],
      luminosity:
        luminosity[
          (actualSeedString.codePointAt(
            actualSeedString.length - 2
          ) as number) % luminosity.length
        ]
    })
  }

  /*
   * Bulma Snippets
   */

  function getMoveUpDownButtonFieldHTML(
    upButtonClassNames: string,
    downButtonClassNames: string,
    isSmall = true
  ): string {
    return `<div class="field has-addons">
      <div class="control">
      <button
          class="button ${isSmall ? 'is-small' : ''} ${upButtonClassNames}"
          data-tooltip="Move Up" data-direction="up" type="button" aria-label="Move Up">
      <i class="fas fa-arrow-up" aria-hidden="true"></i>
      </button>
      </div>
      <div class="control">
      <button
          class="button ${isSmall ? 'is-small' : ''} ${downButtonClassNames}"
          data-tooltip="Move Down" data-direction="down" type="button" aria-label="Move Down">
      <i class="fas fa-arrow-down" aria-hidden="true"></i>
      </button>
      </div>
      </div>`
  }

  function getLoadingParagraphHTML(captionText = 'Loading...'): string {
    return `<p class="has-text-centered has-text-grey">
      <i class="fas fa-5x fa-circle-notch fa-spin" aria-hidden="true"></i><br />
      ${cityssm.escapeHTML(captionText)}
      </p>`
  }

  function getSearchResultsPagerHTML(
    limit: number,
    offset: number,
    count: number
  ): string {
    return `<div class="level">
      <div class="level-left">
        <div class="level-item has-text-weight-bold">
          Displaying
          ${(offset + 1).toString()}
          to
          ${Math.min(count, limit + offset).toString()}
          of
          ${count.toString()}
        </div>
      </div>
      <div class="level-right">
        ${
          offset > 0
            ? `<div class="level-item">
                <button class="button is-rounded is-link is-outlined" data-page="previous" type="button" title="Previous">
                  <i class="fas fa-arrow-left" aria-hidden="true"></i>
                </button>
                </div>`
            : ''
        }
        ${
          limit + offset < count
            ? `<div class="level-item">
                <button class="button is-rounded is-link" data-page="next" type="button" title="Next">
                  <span>Next</span>
                  <span class="icon"><i class="fas fa-arrow-right" aria-hidden="true"></i></span>
                </button>
                </div>`
            : ''
        }
      </div>
      </div>`
  }

  /*
   * URLs
   */

  const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? ''

  function getRecordURL(
    recordTypePlural: 'cemeteries' | 'burialSites' | 'contracts' | 'workOrders',
    recordId: number | string,
    edit: boolean,
    time: boolean
  ): string {
    return (
      urlPrefix +
      '/' +
      recordTypePlural +
      (recordId ? `/${recordId.toString()}` : '') +
      (recordId && edit ? '/edit' : '') +
      (time ? `/?t=${Date.now().toString()}` : '')
    )
  }

  function getCemeteryURL(
    cemeteryId: number | string = '',
    edit = false,
    time = false
  ): string {
    return getRecordURL('cemeteries', cemeteryId, edit, time)
  }

  function getBurialSiteURL(
    burialSiteId: number | string = '',
    edit = false,
    time = false
  ): string {
    return getRecordURL('burialSites', burialSiteId, edit, time)
  }

  function getContractURL(
    contractId: number | string = '',
    edit = false,
    time = false
  ): string {
    return getRecordURL('contracts', contractId, edit, time)
  }

  function getWorkOrderURL(
    workOrderId: number | string = '',
    edit = false,
    time = false
  ): string {
    return getRecordURL('workOrders', workOrderId, edit, time)
  }

  /*
   * Settings
   */

  const dynamicsGPIntegrationIsEnabled =
    exports.dynamicsGPIntegrationIsEnabled as boolean

  /*
   * Declare LOS
   */

  const los: LOS = {
    urlPrefix,
    apiKey: document.querySelector('main')?.dataset.apiKey ?? '',
    dynamicsGPIntegrationIsEnabled,
    highlightMap,
    initializeUnlockFieldButtons,
    initializeDatePickers,

    populateAliases,
    escapedAliases,

    getRandomColor,

    setUnsavedChanges,
    clearUnsavedChanges,
    hasUnsavedChanges,

    getMoveUpDownButtonFieldHTML,
    getLoadingParagraphHTML,
    getSearchResultsPagerHTML,

    getCemeteryURL,
    getBurialSiteURL,
    getContractURL,
    getWorkOrderURL
  }

  exports.los = los
})()

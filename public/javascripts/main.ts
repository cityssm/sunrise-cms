import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'
import type Leaflet from 'leaflet'

import type { Sunrise } from './types.js'

declare const L: typeof Leaflet
declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: Record<string, unknown> & {
  aliases: Record<string, string>
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
   * SVG Mapping
   */

  function highlightMap(
    mapContainerElement: HTMLElement,
    mapKey: string,
    contextualClass: 'danger' | 'success'
  ): void {
    // Search for ID
    let svgId = mapKey

    // eslint-disable-next-line unicorn/no-null
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

  /*
   * Leaflet Mapping
   */

  const coordinatePrecision = 8

  const leafletConstants = {
    tileLayerURL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

    defaultZoom: 15,
    maxZoom: 19,

    attribution: '© OpenStreetMap'
  }

  function openLeafletCoordinateSelectorModal(options: {
    latitudeElement: HTMLInputElement
    longitudeElement: HTMLInputElement

    callbackFunction: (latitude: number, longitude: number) => void
  }): void {
    const latitude = Number.parseFloat(options.latitudeElement.value)
    const longitude = Number.parseFloat(options.longitudeElement.value)

    let currentMarker: Leaflet.Marker | undefined

    cityssm.openHtmlModal('leaflet-selectCoordinate', {
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()

        /*
         * Set up the Leaflet map
         */

        const mapContainerElement = modalElement.querySelector(
          '.leaflet-map'
        ) as HTMLElement

        const map = new L.Map(mapContainerElement)

        new L.TileLayer(sunrise.leafletConstants.tileLayerURL, {
          attribution: sunrise.leafletConstants.attribution,
          maxZoom: sunrise.leafletConstants.maxZoom
        }).addTo(map)

        if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
          const mapCoordinates: Leaflet.LatLngTuple = [latitude, longitude]
          map.setView(mapCoordinates, sunrise.leafletConstants.defaultZoom)
          currentMarker = new L.Marker(mapCoordinates).addTo(map)
        } else {
          const middleLatitude =
            (Number.parseFloat(options.latitudeElement.min) +
              Number.parseFloat(options.latitudeElement.max)) /
            2
          const middleLongitude =
            (Number.parseFloat(options.longitudeElement.min) +
              Number.parseFloat(options.longitudeElement.max)) /
            2

          const mapCoordinates: Leaflet.LatLngTuple = [
            middleLatitude,
            middleLongitude
          ]
          map.setView(mapCoordinates, 5)
        }

        map.on('click', (clickEvent: Leaflet.LeafletMouseEvent) => {
          const mapCoordinates = clickEvent.latlng

          if (currentMarker !== undefined) {
            currentMarker.remove()
          }

          currentMarker = new L.Marker(mapCoordinates).addTo(map)
        })

        modalElement
          .querySelector('.is-update-button')
          ?.addEventListener('click', (clickEvent) => {
            clickEvent.preventDefault()

            if (currentMarker !== undefined) {
              const mapCoordinates = currentMarker.getLatLng()

              options.latitudeElement.value =
                mapCoordinates.lat.toFixed(coordinatePrecision)
              options.longitudeElement.value =
                mapCoordinates.lng.toFixed(coordinatePrecision)

              options.callbackFunction(mapCoordinates.lat, mapCoordinates.lng)
            }

            closeModalFunction()
          })
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  /*
   * Field Unlocking
   */

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
        <span class="icon"><i class="fa-solid fa-arrow-up"></i></span>
      </button>
      </div>
      <div class="control">
      <button
          class="button ${isSmall ? 'is-small' : ''} ${downButtonClassNames}"
          data-tooltip="Move Down" data-direction="down" type="button" aria-label="Move Down">
        <span class="icon"><i class="fa-solid fa-arrow-down"></i></span>
      </button>
      </div>
      </div>`
  }

  function getLoadingParagraphHTML(captionText = 'Loading...'): string {
    return `<p class="has-text-centered has-text-grey">
      <i class="fa-solid fa-5x fa-circle-notch fa-spin"></i><br />
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
      <div class="level-right is-hidden-print">
        ${
          offset > 0
            ? `<div class="level-item">
                <button class="button is-rounded is-link is-outlined" data-page="previous" type="button" title="Previous">
                  <i class="fa-solid fa-arrow-left"></i>
                </button>
                </div>`
            : ''
        }
        ${
          limit + offset < count
            ? `<div class="level-item">
                <button class="button is-rounded is-link" data-page="next" type="button" title="Next">
                  <span>Next</span>
                  <span class="icon"><i class="fa-solid fa-arrow-right"></i></span>
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
    recordTypePlural:
      | 'burialSites'
      | 'cemeteries'
      | 'contracts'
      | 'funeralHomes'
      | 'workOrders',
    recordId: number | string,
    edit: boolean,
    time: boolean
  ): string {
    return (
      `${urlPrefix}/${recordTypePlural}/${recordId.toString()}` +
      (recordId !== '' && edit ? '/edit' : '') +
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

  function getFuneralHomeURL(
    funeralHomeId: number | string = '',
    edit = false,
    time = false
  ): string {
    return getRecordURL('funeralHomes', funeralHomeId, edit, time)
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
   * Date Fields
   */

  function initializeMinDateUpdate(
    minDateElement: HTMLInputElement,
    valueDateElement: HTMLInputElement
  ): void {
    valueDateElement.min = minDateElement.value

    minDateElement.addEventListener('change', () => {
      valueDateElement.min = minDateElement.value
    })
  }

  /*
   * Settings
   */

  const dynamicsGPIntegrationIsEnabled =
    exports.dynamicsGPIntegrationIsEnabled as boolean

  /*
   * Declare sunrise
   */

  const sunrise: Sunrise = {
    apiKey: document.querySelector('main')?.dataset.apiKey ?? '',
    dynamicsGPIntegrationIsEnabled,
    urlPrefix,

    highlightMap,
    leafletConstants,
    openLeafletCoordinateSelectorModal,

    initializeUnlockFieldButtons,

    escapedAliases,
    populateAliases,

    clearUnsavedChanges,
    hasUnsavedChanges,
    setUnsavedChanges,

    getLoadingParagraphHTML,
    getMoveUpDownButtonFieldHTML,
    getSearchResultsPagerHTML,

    getBurialSiteURL,
    getCemeteryURL,
    getContractURL,
    getFuneralHomeURL,
    getWorkOrderURL,

    initializeMinDateUpdate
  }

  exports.sunrise = sunrise
})()

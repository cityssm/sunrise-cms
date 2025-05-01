import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'
import type * as Leaflet from 'leaflet'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const L: typeof Leaflet
declare const exports: {
  sunrise: Sunrise
}
;(() => {
  /*
   * Map
   */

  const sunrise = exports.sunrise

  const mapContainerElement: HTMLElement | null = document.querySelector(
    '#burialSite--leaflet'
  )

  if (mapContainerElement !== null) {
    const mapLatitude = Number.parseFloat(
      mapContainerElement.dataset.latitude ?? ''
    )
    const mapLongitude = Number.parseFloat(
      mapContainerElement.dataset.longitude ?? ''
    )

    const mapCoordinates: Leaflet.LatLngTuple = [mapLatitude, mapLongitude]

    // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
    const map: Leaflet.Map = L.map(mapContainerElement, {
      scrollWheelZoom: false
    })
    map.setView(mapCoordinates, sunrise.leafletConstants.defaultZoom)

    L.tileLayer(sunrise.leafletConstants.tileLayerURL, {
      attribution: sunrise.leafletConstants.attribution,
      maxZoom: sunrise.leafletConstants.maxZoom
    }).addTo(map)

    L.marker(mapCoordinates).addTo(map)
  }

  /*
   * Image
   */

  const svgContainerElement: HTMLElement | null = document.querySelector(
    '#burialSite--cemeterySvg'
  )

  if (svgContainerElement !== null) {
    sunrise.highlightMap(
      svgContainerElement,
      svgContainerElement.dataset.cemeterySvgId ?? '',
      'success'
    )
  }

  /*
   * Contracts
   */

  document
    .querySelector('#burialSite--contractsToggle')
    ?.addEventListener('click', () => {
      const tableRowElements = document.querySelectorAll(
        '#burialSite--contractsTbody tr[data-is-active="false"]'
      )

      for (const tableRowElement of tableRowElements) {
        tableRowElement.classList.toggle('is-hidden')
      }
    })

  /*
   * Restore Deleted
   */

  document
    .querySelector('button.is-restore-burial-site-button')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      const buttonElement = clickEvent.currentTarget as HTMLButtonElement

      const burialSiteId = buttonElement.dataset.burialSiteId ?? ''

      if (burialSiteId === '') {
        return
      }

      function doRestore(): void {
        cityssm.postJSON(
          `${sunrise.urlPrefix}/burialSites/doRestoreBurialSite`,
          { burialSiteId },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as {
              success: boolean
              errorMessage?: string
            }

            if (responseJSON.success) {
              globalThis.location.reload()
            } else {
              bulmaJS.alert({
                title: 'Error Restoring Burial Site',
                message: responseJSON.errorMessage ?? '',
                contextualColorName: 'danger'
              })
            }
          }
        )
      }

      bulmaJS.confirm({
        contextualColorName: 'warning',
        title: 'Restore Burial Site',

        message:
          'Are you sure you want to restore this burial site? It will be visible again.',

        okButton: {
          text: 'Yes, Restore Burial Site',
          callbackFunction: doRestore
        }
      })
    })
})()

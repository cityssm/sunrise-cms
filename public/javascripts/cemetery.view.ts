import type * as Leaflet from 'leaflet'

import type { Sunrise } from './types.js'

declare const L: typeof Leaflet
declare const exports: {
  sunrise: Sunrise
}
;(() => {
  const sunrise = exports.sunrise

  const mapContainerElement: HTMLElement | null =
    document.querySelector('#cemetery--leaflet')

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
})()

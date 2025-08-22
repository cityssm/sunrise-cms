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

    const map = new L.Map(mapContainerElement, {
      scrollWheelZoom: false
    })
    map.setView(mapCoordinates, sunrise.leafletConstants.defaultZoom)

    new L.TileLayer(sunrise.leafletConstants.tileLayerURL, {
      attribution: sunrise.leafletConstants.attribution,
      maxZoom: sunrise.leafletConstants.maxZoom
    }).addTo(map)

    new L.Marker(mapCoordinates).addTo(map)
  }
})()

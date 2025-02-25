// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */

import type * as Leaflet from 'leaflet'

declare const L
;(() => {
  const mapContainerElement: HTMLElement | null =
    document.querySelector('#map--leaflet')

  if (mapContainerElement !== null) {
    const mapLatitude = Number.parseFloat(
      mapContainerElement.dataset.mapLatitude ?? ''
    )
    const mapLongitude = Number.parseFloat(
      mapContainerElement.dataset.mapLongitude ?? ''
    )

    const mapCoordinates: Leaflet.LatLngTuple = [mapLatitude, mapLongitude]

    // eslint-disable-next-line unicorn/no-array-callback-reference
    const map: Leaflet.Map = L.map(mapContainerElement)
    map.setView(mapCoordinates, 15)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map)

    L.marker(mapCoordinates).addTo(map)
  }
})()

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const mapContainerElement = document.querySelector('#cemetery--leaflet');
    if (mapContainerElement !== null) {
        const mapLatitude = Number.parseFloat(mapContainerElement.dataset.latitude ?? '');
        const mapLongitude = Number.parseFloat(mapContainerElement.dataset.longitude ?? '');
        const mapCoordinates = [mapLatitude, mapLongitude];
        // eslint-disable-next-line unicorn/no-array-callback-reference
        const map = L.map(mapContainerElement);
        map.setView(mapCoordinates, sunrise.leafletConstants.defaultZoom);
        L.tileLayer(sunrise.leafletConstants.tileLayerURL, {
            attribution: sunrise.leafletConstants.attribution,
            maxZoom: sunrise.leafletConstants.maxZoom
        }).addTo(map);
        L.marker(mapCoordinates).addTo(map);
    }
})();

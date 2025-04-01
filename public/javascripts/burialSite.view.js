"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    /*
     * Map
     */
    const sunrise = exports.sunrise;
    const mapContainerElement = document.querySelector('#burialSite--leaflet');
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
    /*
     * Image
     */
    const svgContainerElement = document.querySelector('#burialSite--cemeterySvg');
    if (svgContainerElement !== null) {
        sunrise.highlightMap(svgContainerElement, svgContainerElement.dataset.cemeterySvgId ?? '', 'success');
    }
    /*
     * Contracts
     */
    document
        .querySelector('#burialSite--contractsToggle')
        ?.addEventListener('click', () => {
        const tableRowElements = document.querySelectorAll('#burialSite--contractsTbody tr[data-is-active="false"]');
        for (const tableRowElement of tableRowElements) {
            tableRowElement.classList.toggle('is-hidden');
        }
    });
})();

(() => {
    const sunrise = exports.sunrise;
    const mapContainerElement = document.querySelector('#cemetery--leaflet');
    if (mapContainerElement !== null) {
        const mapLatitude = Number.parseFloat(mapContainerElement.dataset.latitude ?? '');
        const mapLongitude = Number.parseFloat(mapContainerElement.dataset.longitude ?? '');
        const mapCoordinates = [mapLatitude, mapLongitude];
        const map = new L.Map(mapContainerElement, {
            scrollWheelZoom: false
        });
        map.setView(mapCoordinates, sunrise.leafletConstants.defaultZoom);
        new L.TileLayer(sunrise.leafletConstants.tileLayerUrl, {
            attribution: sunrise.leafletConstants.attribution,
            maxZoom: sunrise.leafletConstants.maxZoom
        }).addTo(map);
        new L.Marker(mapCoordinates).addTo(map);
    }
})();

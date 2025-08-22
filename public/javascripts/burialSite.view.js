"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    /*
     * Map
     */
    var _a, _b, _c, _d, _e;
    var sunrise = exports.sunrise;
    var mapContainerElement = document.querySelector('#burialSite--leaflet');
    if (mapContainerElement !== null) {
        var mapLatitude = Number.parseFloat((_a = mapContainerElement.dataset.latitude) !== null && _a !== void 0 ? _a : '');
        var mapLongitude = Number.parseFloat((_b = mapContainerElement.dataset.longitude) !== null && _b !== void 0 ? _b : '');
        var mapCoordinates = [mapLatitude, mapLongitude];
        // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
        var map = new L.Map(mapContainerElement, {
            scrollWheelZoom: false
        });
        map.setView(mapCoordinates, sunrise.leafletConstants.defaultZoom);
        new L.TileLayer(sunrise.leafletConstants.tileLayerURL, {
            attribution: sunrise.leafletConstants.attribution,
            maxZoom: sunrise.leafletConstants.maxZoom
        }).addTo(map);
        new L.Marker(mapCoordinates).addTo(map);
    }
    /*
     * Image
     */
    var svgContainerElement = document.querySelector('#burialSite--cemeterySvg');
    if (svgContainerElement !== null) {
        sunrise.highlightMap(svgContainerElement, (_c = svgContainerElement.dataset.cemeterySvgId) !== null && _c !== void 0 ? _c : '', 'success');
    }
    /*
     * Contracts
     */
    (_d = document
        .querySelector('#burialSite--contractsToggle')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', function () {
        var tableRowElements = document.querySelectorAll('#burialSite--contractsTbody tr[data-is-active="false"]');
        for (var _i = 0, tableRowElements_1 = tableRowElements; _i < tableRowElements_1.length; _i++) {
            var tableRowElement = tableRowElements_1[_i];
            tableRowElement.classList.toggle('is-hidden');
        }
    });
    /*
     * Restore Deleted
     */
    (_e = document
        .querySelector('button.is-restore-burial-site-button')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', function (clickEvent) {
        var _a;
        clickEvent.preventDefault();
        var buttonElement = clickEvent.currentTarget;
        var burialSiteId = (_a = buttonElement.dataset.burialSiteId) !== null && _a !== void 0 ? _a : '';
        if (burialSiteId === '') {
            return;
        }
        function doRestore() {
            cityssm.postJSON("".concat(sunrise.urlPrefix, "/burialSites/doRestoreBurialSite"), { burialSiteId: burialSiteId }, function (rawResponseJSON) {
                var _a;
                var responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    globalThis.location.reload();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Restoring Burial Site',
                        message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : ''
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Restore Burial Site',
            message: 'Are you sure you want to restore this burial site? It will be visible again.',
            okButton: {
                callbackFunction: doRestore,
                text: 'Yes, Restore Burial Site'
            }
        });
    });
})();

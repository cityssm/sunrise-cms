"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    /*
     * Unsaved Changes
     */
    var _a, _b, _c, _d;
    var _hasUnsavedChanges = false;
    function setUnsavedChanges() {
        if (!hasUnsavedChanges()) {
            _hasUnsavedChanges = true;
            cityssm.enableNavBlocker();
        }
    }
    function clearUnsavedChanges() {
        _hasUnsavedChanges = false;
        cityssm.disableNavBlocker();
    }
    function hasUnsavedChanges() {
        return _hasUnsavedChanges;
    }
    /*
     * SVG Mapping
     */
    function highlightMap(mapContainerElement, mapKey, contextualClass) {
        // Search for ID
        var svgId = mapKey;
        // eslint-disable-next-line unicorn/no-null
        var svgElementToHighlight = null;
        while (svgId !== '') {
            svgElementToHighlight = mapContainerElement.querySelector("#".concat(svgId));
            if (svgElementToHighlight !== null || !svgId.includes('-')) {
                break;
            }
            svgId = svgId.slice(0, Math.max(0, svgId.lastIndexOf('-')));
        }
        if (svgElementToHighlight !== null) {
            svgElementToHighlight.style.fill = '';
            svgElementToHighlight.classList.add('highlight', "is-".concat(contextualClass));
            var childPathElements = svgElementToHighlight.querySelectorAll('path');
            for (var _i = 0, childPathElements_1 = childPathElements; _i < childPathElements_1.length; _i++) {
                var pathElement = childPathElements_1[_i];
                pathElement.style.fill = '';
            }
        }
    }
    /*
     * Leaflet Mapping
     */
    var coordinatePrecision = 8;
    var leafletConstants = {
        tileLayerURL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        defaultZoom: 15,
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    };
    function openLeafletCoordinateSelectorModal(options) {
        var latitude = Number.parseFloat(options.latitudeElement.value);
        var longitude = Number.parseFloat(options.longitudeElement.value);
        var currentMarker;
        cityssm.openHtmlModal('leaflet-selectCoordinate', {
            onshown: function (modalElement, closeModalFunction) {
                var _a;
                bulmaJS.toggleHtmlClipped();
                /*
                 * Set up the Leaflet map
                 */
                var mapContainerElement = modalElement.querySelector('.leaflet-map');
                // eslint-disable-next-line unicorn/no-array-callback-reference
                var map = new L.Map(mapContainerElement);
                new L.TileLayer(sunrise.leafletConstants.tileLayerURL, {
                    attribution: sunrise.leafletConstants.attribution,
                    maxZoom: sunrise.leafletConstants.maxZoom
                }).addTo(map);
                if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
                    var mapCoordinates = [latitude, longitude];
                    map.setView(mapCoordinates, sunrise.leafletConstants.defaultZoom);
                    currentMarker = new L.Marker(mapCoordinates).addTo(map);
                }
                else {
                    var middleLatitude = (Number.parseFloat(options.latitudeElement.min) +
                        Number.parseFloat(options.latitudeElement.max)) /
                        2;
                    var middleLongitude = (Number.parseFloat(options.longitudeElement.min) +
                        Number.parseFloat(options.longitudeElement.max)) /
                        2;
                    var mapCoordinates = [
                        middleLatitude,
                        middleLongitude
                    ];
                    map.setView(mapCoordinates, 5);
                }
                map.on('click', function (clickEvent) {
                    var mapCoordinates = clickEvent.latlng;
                    if (currentMarker !== undefined) {
                        currentMarker.remove();
                    }
                    currentMarker = new L.Marker(mapCoordinates).addTo(map);
                });
                (_a = modalElement
                    .querySelector('.is-update-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (clickEvent) {
                    clickEvent.preventDefault();
                    if (currentMarker !== undefined) {
                        var mapCoordinates = currentMarker.getLatLng();
                        options.latitudeElement.value =
                            mapCoordinates.lat.toFixed(coordinatePrecision);
                        options.longitudeElement.value =
                            mapCoordinates.lng.toFixed(coordinatePrecision);
                        options.callbackFunction(mapCoordinates.lat, mapCoordinates.lng);
                    }
                    closeModalFunction();
                });
            },
            onremoved: function () {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    /*
     * Field Unlocking
     */
    function unlockField(clickEvent) {
        var fieldElement = clickEvent.currentTarget.closest('.field');
        var inputOrSelectElement = fieldElement.querySelector('input, select');
        inputOrSelectElement.classList.remove('is-readonly');
        if (inputOrSelectElement.tagName === 'INPUT') {
            ;
            inputOrSelectElement.readOnly = false;
            inputOrSelectElement.disabled = false;
        }
        else {
            var optionElements = inputOrSelectElement.querySelectorAll('option');
            for (var _i = 0, optionElements_1 = optionElements; _i < optionElements_1.length; _i++) {
                var optionElement = optionElements_1[_i];
                optionElement.disabled = false;
            }
        }
        inputOrSelectElement.focus();
    }
    function initializeUnlockFieldButtons(containerElement) {
        var unlockFieldButtonElements = containerElement.querySelectorAll('.is-unlock-field-button');
        for (var _i = 0, unlockFieldButtonElements_1 = unlockFieldButtonElements; _i < unlockFieldButtonElements_1.length; _i++) {
            var unlockFieldButtonElement = unlockFieldButtonElements_1[_i];
            unlockFieldButtonElement.addEventListener('click', unlockField);
        }
    }
    /*
     * Aliases
     */
    function populateAliases(containerElement) {
        var aliasElements = containerElement.querySelectorAll('.alias');
        for (var _i = 0, aliasElements_1 = aliasElements; _i < aliasElements_1.length; _i++) {
            var aliasElement = aliasElements_1[_i];
            if (aliasElement.dataset.alias === 'ExternalReceiptNumber') {
                aliasElement.textContent = exports.aliases.externalReceiptNumber;
                break;
            }
        }
    }
    var escapedAliases = Object.freeze({
        ExternalReceiptNumber: cityssm.escapeHTML(exports.aliases.externalReceiptNumber),
        externalReceiptNumber: cityssm.escapeHTML(exports.aliases.externalReceiptNumber.toLowerCase()),
        WorkOrderOpenDate: cityssm.escapeHTML(exports.aliases.workOrderOpenDate),
        workOrderOpenDate: cityssm.escapeHTML(exports.aliases.workOrderOpenDate.toLowerCase()),
        WorkOrderCloseDate: cityssm.escapeHTML(exports.aliases.workOrderCloseDate),
        workOrderCloseDate: cityssm.escapeHTML(exports.aliases.workOrderCloseDate.toLowerCase())
    });
    /*
     * Colors
     */
    var hues = [
        'red',
        'green',
        'orange',
        'blue',
        'pink',
        'yellow',
        'purple'
    ];
    var luminosity = ['bright', 'light', 'dark'];
    function getRandomColor(seedString) {
        var actualSeedString = seedString;
        if (actualSeedString.length < 2) {
            actualSeedString += 'a1';
        }
        return exports.randomColor({
            hue: hues[actualSeedString.codePointAt(actualSeedString.length - 1) %
                hues.length],
            luminosity: luminosity[actualSeedString.codePointAt(actualSeedString.length - 2) % luminosity.length],
            seed: actualSeedString + actualSeedString
        });
    }
    /*
     * Bulma Snippets
     */
    function getMoveUpDownButtonFieldHTML(upButtonClassNames, downButtonClassNames, isSmall) {
        if (isSmall === void 0) { isSmall = true; }
        return "<div class=\"field has-addons\">\n      <div class=\"control\">\n      <button\n          class=\"button ".concat(isSmall ? 'is-small' : '', " ").concat(upButtonClassNames, "\"\n          data-tooltip=\"Move Up\" data-direction=\"up\" type=\"button\" aria-label=\"Move Up\">\n        <span class=\"icon\"><i class=\"fa-solid fa-arrow-up\"></i></span>\n      </button>\n      </div>\n      <div class=\"control\">\n      <button\n          class=\"button ").concat(isSmall ? 'is-small' : '', " ").concat(downButtonClassNames, "\"\n          data-tooltip=\"Move Down\" data-direction=\"down\" type=\"button\" aria-label=\"Move Down\">\n        <span class=\"icon\"><i class=\"fa-solid fa-arrow-down\"></i></span>\n      </button>\n      </div>\n      </div>");
    }
    function getLoadingParagraphHTML(captionText) {
        if (captionText === void 0) { captionText = 'Loading...'; }
        return "<p class=\"has-text-centered has-text-grey\">\n      <i class=\"fa-solid fa-5x fa-circle-notch fa-spin\"></i><br />\n      ".concat(cityssm.escapeHTML(captionText), "\n      </p>");
    }
    function getSearchResultsPagerHTML(limit, offset, count) {
        return "<div class=\"level\">\n      <div class=\"level-left\">\n        <div class=\"level-item has-text-weight-bold\">\n          Displaying\n          ".concat((offset + 1).toString(), "\n          to\n          ").concat(Math.min(count, limit + offset).toString(), "\n          of\n          ").concat(count.toString(), "\n        </div>\n      </div>\n      <div class=\"level-right is-hidden-print\">\n        ").concat(offset > 0
            ? "<div class=\"level-item\">\n                <button class=\"button is-rounded is-link is-outlined\" data-page=\"previous\" type=\"button\" title=\"Previous\">\n                  <i class=\"fa-solid fa-arrow-left\"></i>\n                </button>\n                </div>"
            : '', "\n        ").concat(limit + offset < count
            ? "<div class=\"level-item\">\n                <button class=\"button is-rounded is-link\" data-page=\"next\" type=\"button\" title=\"Next\">\n                  <span>Next</span>\n                  <span class=\"icon\"><i class=\"fa-solid fa-arrow-right\"></i></span>\n                </button>\n                </div>"
            : '', "\n      </div>\n      </div>");
    }
    /*
     * URLs
     */
    var urlPrefix = (_b = (_a = document.querySelector('main')) === null || _a === void 0 ? void 0 : _a.dataset.urlPrefix) !== null && _b !== void 0 ? _b : '';
    function getRecordURL(recordTypePlural, recordId, edit, time) {
        return (urlPrefix +
            '/' +
            recordTypePlural +
            (recordId ? "/".concat(recordId.toString()) : '') +
            (recordId && edit ? '/edit' : '') +
            (time ? "/?t=".concat(Date.now().toString()) : ''));
    }
    function getCemeteryURL(cemeteryId, edit, time) {
        if (cemeteryId === void 0) { cemeteryId = ''; }
        if (edit === void 0) { edit = false; }
        if (time === void 0) { time = false; }
        return getRecordURL('cemeteries', cemeteryId, edit, time);
    }
    function getFuneralHomeURL(funeralHomeId, edit, time) {
        if (funeralHomeId === void 0) { funeralHomeId = ''; }
        if (edit === void 0) { edit = false; }
        if (time === void 0) { time = false; }
        return getRecordURL('funeralHomes', funeralHomeId, edit, time);
    }
    function getBurialSiteURL(burialSiteId, edit, time) {
        if (burialSiteId === void 0) { burialSiteId = ''; }
        if (edit === void 0) { edit = false; }
        if (time === void 0) { time = false; }
        return getRecordURL('burialSites', burialSiteId, edit, time);
    }
    function getContractURL(contractId, edit, time) {
        if (contractId === void 0) { contractId = ''; }
        if (edit === void 0) { edit = false; }
        if (time === void 0) { time = false; }
        return getRecordURL('contracts', contractId, edit, time);
    }
    function getWorkOrderURL(workOrderId, edit, time) {
        if (workOrderId === void 0) { workOrderId = ''; }
        if (edit === void 0) { edit = false; }
        if (time === void 0) { time = false; }
        return getRecordURL('workOrders', workOrderId, edit, time);
    }
    /*
     * Date Fields
     */
    function initializeMinDateUpdate(minDateElement, valueDateElement) {
        valueDateElement.min = minDateElement.value;
        minDateElement.addEventListener('change', function () {
            valueDateElement.min = minDateElement.value;
        });
    }
    /*
     * Settings
     */
    var dynamicsGPIntegrationIsEnabled = exports.dynamicsGPIntegrationIsEnabled;
    /*
     * Declare sunrise
     */
    var sunrise = {
        apiKey: (_d = (_c = document.querySelector('main')) === null || _c === void 0 ? void 0 : _c.dataset.apiKey) !== null && _d !== void 0 ? _d : '',
        dynamicsGPIntegrationIsEnabled: dynamicsGPIntegrationIsEnabled,
        urlPrefix: urlPrefix,
        highlightMap: highlightMap,
        leafletConstants: leafletConstants,
        openLeafletCoordinateSelectorModal: openLeafletCoordinateSelectorModal,
        initializeUnlockFieldButtons: initializeUnlockFieldButtons,
        escapedAliases: escapedAliases,
        populateAliases: populateAliases,
        getRandomColor: getRandomColor,
        clearUnsavedChanges: clearUnsavedChanges,
        hasUnsavedChanges: hasUnsavedChanges,
        setUnsavedChanges: setUnsavedChanges,
        getLoadingParagraphHTML: getLoadingParagraphHTML,
        getMoveUpDownButtonFieldHTML: getMoveUpDownButtonFieldHTML,
        getSearchResultsPagerHTML: getSearchResultsPagerHTML,
        getBurialSiteURL: getBurialSiteURL,
        getCemeteryURL: getCemeteryURL,
        getContractURL: getContractURL,
        getFuneralHomeURL: getFuneralHomeURL,
        getWorkOrderURL: getWorkOrderURL,
        initializeMinDateUpdate: initializeMinDateUpdate
    };
    exports.sunrise = sunrise;
})();

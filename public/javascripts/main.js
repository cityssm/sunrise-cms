"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    /*
     * Unsaved Changes
     */
    let _hasUnsavedChanges = false;
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
        let svgId = mapKey;
        // eslint-disable-next-line unicorn/no-null
        let svgElementToHighlight = null;
        while (svgId !== '') {
            svgElementToHighlight = mapContainerElement.querySelector(`#${svgId}`);
            if (svgElementToHighlight !== null || !svgId.includes('-')) {
                break;
            }
            svgId = svgId.slice(0, Math.max(0, svgId.lastIndexOf('-')));
        }
        if (svgElementToHighlight !== null) {
            svgElementToHighlight.style.fill = '';
            svgElementToHighlight.classList.add('highlight', `is-${contextualClass}`);
            const childPathElements = svgElementToHighlight.querySelectorAll('path');
            for (const pathElement of childPathElements) {
                pathElement.style.fill = '';
            }
        }
    }
    /*
     * Leaflet Mapping
     */
    const coordinatePrecision = 8;
    const leafletConstants = {
        tileLayerURL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        defaultZoom: 15,
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    };
    function openLeafletCoordinateSelectorModal(options) {
        const latitude = Number.parseFloat(options.latitudeElement.value);
        const longitude = Number.parseFloat(options.longitudeElement.value);
        let currentMarker;
        cityssm.openHtmlModal('leaflet-selectCoordinate', {
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                /*
                 * Set up the Leaflet map
                 */
                const mapContainerElement = modalElement.querySelector('.leaflet-map');
                const map = new L.Map(mapContainerElement);
                new L.TileLayer(sunrise.leafletConstants.tileLayerURL, {
                    attribution: sunrise.leafletConstants.attribution,
                    maxZoom: sunrise.leafletConstants.maxZoom
                }).addTo(map);
                if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
                    const mapCoordinates = [latitude, longitude];
                    map.setView(mapCoordinates, sunrise.leafletConstants.defaultZoom);
                    currentMarker = new L.Marker(mapCoordinates).addTo(map);
                }
                else {
                    const middleLatitude = (Number.parseFloat(options.latitudeElement.min) +
                        Number.parseFloat(options.latitudeElement.max)) /
                        2;
                    const middleLongitude = (Number.parseFloat(options.longitudeElement.min) +
                        Number.parseFloat(options.longitudeElement.max)) /
                        2;
                    const mapCoordinates = [
                        middleLatitude,
                        middleLongitude
                    ];
                    map.setView(mapCoordinates, 5);
                }
                map.on('click', (clickEvent) => {
                    const mapCoordinates = clickEvent.latlng;
                    if (currentMarker !== undefined) {
                        currentMarker.remove();
                    }
                    currentMarker = new L.Marker(mapCoordinates).addTo(map);
                });
                modalElement
                    .querySelector('.is-update-button')
                    ?.addEventListener('click', (clickEvent) => {
                    clickEvent.preventDefault();
                    if (currentMarker !== undefined) {
                        const mapCoordinates = currentMarker.getLatLng();
                        options.latitudeElement.value =
                            mapCoordinates.lat.toFixed(coordinatePrecision);
                        options.longitudeElement.value =
                            mapCoordinates.lng.toFixed(coordinatePrecision);
                        options.callbackFunction(mapCoordinates.lat, mapCoordinates.lng);
                    }
                    closeModalFunction();
                });
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    /*
     * Field Unlocking
     */
    function unlockField(clickEvent) {
        const fieldElement = clickEvent.currentTarget.closest('.field');
        const inputOrSelectElement = fieldElement.querySelector('input, select');
        inputOrSelectElement.classList.remove('is-readonly');
        if (inputOrSelectElement.tagName === 'INPUT') {
            ;
            inputOrSelectElement.readOnly = false;
            inputOrSelectElement.disabled = false;
        }
        else {
            const optionElements = inputOrSelectElement.querySelectorAll('option');
            for (const optionElement of optionElements) {
                optionElement.disabled = false;
            }
        }
        inputOrSelectElement.focus();
    }
    function initializeUnlockFieldButtons(containerElement) {
        const unlockFieldButtonElements = containerElement.querySelectorAll('.is-unlock-field-button');
        for (const unlockFieldButtonElement of unlockFieldButtonElements) {
            unlockFieldButtonElement.addEventListener('click', unlockField);
        }
    }
    /*
     * Aliases
     */
    function populateAliases(containerElement) {
        const aliasElements = containerElement.querySelectorAll('.alias');
        for (const aliasElement of aliasElements) {
            if (aliasElement.dataset.alias === 'ExternalReceiptNumber') {
                aliasElement.textContent = exports.aliases.externalReceiptNumber;
                break;
            }
        }
    }
    const escapedAliases = Object.freeze({
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
    const hues = [
        'red',
        'green',
        'orange',
        'blue',
        'pink',
        'yellow',
        'purple'
    ];
    const luminosity = ['bright', 'light', 'dark'];
    function getRandomColor(seedString) {
        let actualSeedString = seedString;
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
    function getMoveUpDownButtonFieldHTML(upButtonClassNames, downButtonClassNames, isSmall = true) {
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
      </div>`;
    }
    function getLoadingParagraphHTML(captionText = 'Loading...') {
        return `<p class="has-text-centered has-text-grey">
      <i class="fa-solid fa-5x fa-circle-notch fa-spin"></i><br />
      ${cityssm.escapeHTML(captionText)}
      </p>`;
    }
    function getSearchResultsPagerHTML(limit, offset, count) {
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
        ${offset > 0
            ? `<div class="level-item">
                <button class="button is-rounded is-link is-outlined" data-page="previous" type="button" title="Previous">
                  <i class="fa-solid fa-arrow-left"></i>
                </button>
                </div>`
            : ''}
        ${limit + offset < count
            ? `<div class="level-item">
                <button class="button is-rounded is-link" data-page="next" type="button" title="Next">
                  <span>Next</span>
                  <span class="icon"><i class="fa-solid fa-arrow-right"></i></span>
                </button>
                </div>`
            : ''}
      </div>
      </div>`;
    }
    /*
     * URLs
     */
    const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? '';
    function getRecordURL(recordTypePlural, recordId, edit, time) {
        return (urlPrefix +
            '/' +
            recordTypePlural +
            (recordId ? `/${recordId.toString()}` : '') +
            (recordId && edit ? '/edit' : '') +
            (time ? `/?t=${Date.now().toString()}` : ''));
    }
    function getCemeteryURL(cemeteryId = '', edit = false, time = false) {
        return getRecordURL('cemeteries', cemeteryId, edit, time);
    }
    function getFuneralHomeURL(funeralHomeId = '', edit = false, time = false) {
        return getRecordURL('funeralHomes', funeralHomeId, edit, time);
    }
    function getBurialSiteURL(burialSiteId = '', edit = false, time = false) {
        return getRecordURL('burialSites', burialSiteId, edit, time);
    }
    function getContractURL(contractId = '', edit = false, time = false) {
        return getRecordURL('contracts', contractId, edit, time);
    }
    function getWorkOrderURL(workOrderId = '', edit = false, time = false) {
        return getRecordURL('workOrders', workOrderId, edit, time);
    }
    /*
     * Date Fields
     */
    function initializeMinDateUpdate(minDateElement, valueDateElement) {
        valueDateElement.min = minDateElement.value;
        minDateElement.addEventListener('change', () => {
            valueDateElement.min = minDateElement.value;
        });
    }
    /*
     * Settings
     */
    const dynamicsGPIntegrationIsEnabled = exports.dynamicsGPIntegrationIsEnabled;
    /*
     * Declare sunrise
     */
    const sunrise = {
        apiKey: document.querySelector('main')?.dataset.apiKey ?? '',
        dynamicsGPIntegrationIsEnabled,
        urlPrefix,
        highlightMap,
        leafletConstants,
        openLeafletCoordinateSelectorModal,
        initializeUnlockFieldButtons,
        escapedAliases,
        populateAliases,
        getRandomColor,
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
    };
    exports.sunrise = sunrise;
})();

(() => {
    const sunrise = exports.sunrise;
    const initialCemeteryId = exports.cemeteryId;
    const mapElement = document.querySelector('#map--burialSites');
    const cemeterySelectElement = document.querySelector('#filter--cemeteryId');
    const deceasedNameFilterElement = document.querySelector('#filter--deceasedName');
    const statsMappedElement = document.querySelector('#stats--mapped');
    const statsTotalElement = document.querySelector('#stats--total');
    let allBurialSites = [];
    let leafletMap;
    let markersLayer;
    // Initialize Leaflet map
    function initializeMap() {
        if (leafletMap === undefined) {
            leafletMap = new L.Map(mapElement, {
                center: [exports.centerLatitude, exports.centerLongitude],
                scrollWheelZoom: true,
                zoom: 11
            });
            new L.TileLayer(sunrise.leafletConstants.tileLayerUrl, {
                attribution: sunrise.leafletConstants.attribution,
                maxZoom: sunrise.leafletConstants.maxZoom
            }).addTo(leafletMap);
            markersLayer = new L.LayerGroup().addTo(leafletMap);
        }
    }
    // Determine marker color based on contract status
    function getMarkerColor(contracts, currentDate) {
        if (contracts.length === 0) {
            return 'green'; // No active contracts
        }
        let hasActivePreneed = false;
        let hasActiveNonPreneed = false;
        let allAreFuture = true;
        for (const contract of contracts) {
            const isFuture = contract.contractStartDate > currentDate;
            if (!isFuture) {
                allAreFuture = false;
                if (contract.isPreneed) {
                    hasActivePreneed = true;
                }
                else {
                    hasActiveNonPreneed = true;
                }
            }
        }
        if (hasActiveNonPreneed) {
            return 'red'; // Has active non-preneed contracts
        }
        if (hasActivePreneed || allAreFuture) {
            return 'yellow'; // Only preneed or all future contracts
        }
        return 'green'; // Default
    }
    // Create popup content for a burial site
    function createPopupContent(site) {
        const siteUrl = sunrise.getBurialSiteUrl(site.burialSiteId);
        /* eslint-disable html/require-closing-tags */
        let html = /* html */ `
      <div class="content is-small">
        <p class="has-text-weight-bold mb-2">
          <a href="${siteUrl}" target="_blank">
            ${cityssm.escapeHTML(site.burialSiteName === '' ? 'Unnamed Site' : site.burialSiteName)}
          </a>
        </p>
    `;
        if (site.contracts.length > 0) {
            html += /* html */ `
        <p class="mb-1">
          <strong>Active/Future Contracts:</strong>
        </p>
        <ul class="mb-0">
      `;
            for (const contract of site.contracts) {
                const contractUrl = sunrise.getContractUrl(contract.contractId);
                const deceasedText = contract.deceasedNames.length > 0
                    ? ' - ' + cityssm.escapeHTML(contract.deceasedNames.join(', '))
                    : '';
                html += /* html */ `
          <li class="is-size-7">
            <a href="${contractUrl}" target="_blank">
              ${cityssm.escapeHTML(contract.contractNumber)}
            </a>
            - ${cityssm.escapeHTML(contract.contractType)}${deceasedText}
          </li>
        `;
            }
            html += '</ul>';
        }
        else {
            html += '<p class="is-size-7 has-text-grey-light">No active contracts</p>';
        }
        html += '</div>';
        /* eslint-enable html/require-closing-tags */
        return html;
    }
    // Filter burial sites by deceased name
    function filterBurialSites() {
        const deceasedNameFilter = deceasedNameFilterElement.value
            .toLowerCase()
            .trim();
        if (deceasedNameFilter === '') {
            return allBurialSites;
        }
        return allBurialSites.filter((site) => {
            if (site.contracts.length === 0) {
                return false;
            }
            return site.contracts.some((contract) => {
                if (contract.deceasedNames.length === 0) {
                    return false;
                }
                // eslint-disable-next-line max-nested-callbacks
                return contract.deceasedNames.some((name) => name.toLowerCase().includes(deceasedNameFilter));
            });
        });
    }
    // Render burial sites on the map
    function renderMap(cemeteryLatitude, cemeteryLongitude) {
        if (markersLayer === undefined || leafletMap === undefined) {
            return;
        }
        // Clear existing markers
        markersLayer.clearLayers();
        const filteredSites = filterBurialSites();
        // Get current date for contract status checks
        const currentDate = Number.parseInt(cityssm.dateToString(new Date()).replaceAll('-', ''), 10);
        const bounds = [];
        for (const site of filteredSites) {
            if (site.burialSiteLatitude === null ||
                site.burialSiteLongitude === null) {
                continue;
            }
            const coords = [
                site.burialSiteLatitude,
                site.burialSiteLongitude
            ];
            bounds.push(coords);
            const color = getMarkerColor(site.contracts, currentDate);
            const marker = new L.CircleMarker(coords, {
                radius: 6,
                fillColor: color,
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.7
            });
            marker.bindPopup(createPopupContent(site));
            marker.addTo(markersLayer);
        }
        // Fit map to show all markers, or center on cemetery if no markers
        if (bounds.length > 0) {
            leafletMap.fitBounds(bounds, {
                maxZoom: 16,
                padding: [50, 50]
            });
        }
        else if (cemeteryLatitude !== null &&
            cemeteryLatitude !== undefined &&
            cemeteryLongitude !== null &&
            cemeteryLongitude !== undefined) {
            // No burial sites with coordinates, center on cemetery
            leafletMap.setView([cemeteryLatitude, cemeteryLongitude], 15);
        }
    }
    // Load burial sites for selected cemetery
    function loadBurialSites() {
        const cemeteryId = cemeterySelectElement.value;
        if (cemeteryId === '') {
            allBurialSites = [];
            if (markersLayer !== undefined) {
                markersLayer.clearLayers();
            }
            statsMappedElement.textContent = '0';
            statsTotalElement.textContent = '0';
            return;
        }
        cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doGetBurialSitesForMap`, { cemeteryId }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                allBurialSites = responseJSON.burialSites;
                // Update stats
                const mappedCount = allBurialSites.length;
                const totalCount = responseJSON.totalBurialSites;
                statsMappedElement.textContent = mappedCount.toString();
                statsTotalElement.textContent = totalCount.toString();
                renderMap(responseJSON.cemeteryLatitude, responseJSON.cemeteryLongitude);
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Loading Burial Sites',
                    message: responseJSON.errorMessage ??
                        'An error occurred while loading burial sites. Please try again.'
                });
            }
        });
    }
    // Initialize
    initializeMap();
    // Event listeners
    cemeterySelectElement.addEventListener('change', loadBurialSites);
    let deceasedNameTimeout;
    deceasedNameFilterElement.addEventListener('input', () => {
        clearTimeout(deceasedNameTimeout);
        deceasedNameTimeout = setTimeout(() => {
            // When filtering, don't pass cemetery coordinates as we want to keep the current view
            renderMap();
        }, 300);
    });
    // Load initial cemetery if provided
    if (initialCemeteryId !== null) {
        loadBurialSites();
    }
})();

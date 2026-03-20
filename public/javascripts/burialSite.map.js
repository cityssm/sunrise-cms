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
    function getMarkerColor(contracts, currentDate) {
        if (contracts.length === 0) {
            return 'green';
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
            return 'red';
        }
        if (hasActivePreneed || allAreFuture) {
            return 'yellow';
        }
        return 'green';
    }
    function createPopupContent(site) {
        const siteUrl = sunrise.getBurialSiteUrl(site.burialSiteId);
        let html = `
      <div class="content is-small">
        <p class="has-text-weight-bold mb-2">
          <a href="${siteUrl}" target="_blank">
            ${cityssm.escapeHTML(site.burialSiteName === '' ? 'Unnamed Site' : site.burialSiteName)}
          </a>
        </p>
    `;
        if (site.contracts.length > 0) {
            html += `
        <p class="mb-1">
          <strong>Active/Future Contracts:</strong>
        </p>
        <ul class="mb-0">
      `;
            for (const contract of site.contracts) {
                const contractUrl = sunrise.getContractUrl(contract.contractId);
                const deceasedText = contract.deceasedNames.length > 0
                    ? ` - ${cityssm.escapeHTML(contract.deceasedNames.join(', '))}`
                    : '';
                html += `
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
        return html;
    }
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
                return contract.deceasedNames.some((name) => name.toLowerCase().includes(deceasedNameFilter));
            });
        });
    }
    function renderMap(cemeteryLatitude, cemeteryLongitude) {
        if (markersLayer === undefined || leafletMap === undefined) {
            return;
        }
        markersLayer.clearLayers();
        const filteredSites = filterBurialSites();
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
            leafletMap.setView([cemeteryLatitude, cemeteryLongitude], 15);
        }
    }
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
                    message: responseJSON.errorMessage
                });
            }
        });
    }
    initializeMap();
    cemeterySelectElement.addEventListener('change', loadBurialSites);
    let deceasedNameTimeout;
    deceasedNameFilterElement.addEventListener('input', () => {
        clearTimeout(deceasedNameTimeout);
        deceasedNameTimeout = setTimeout(() => {
            renderMap();
        }, 300);
    });
    if (initialCemeteryId !== null) {
        loadBurialSites();
    }
})();

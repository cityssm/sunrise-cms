(() => {
  const sunrise = exports.sunrise;
  const cityssm = exports.cityssm;
  const initialCemeteryId = exports.initialCemeteryId;

  const mapElement = document.querySelector('#map--burialSites');
  const cemeterySelectElement = document.querySelector('#filter--cemeteryId');
  const deceasedNameFilterElement = document.querySelector('#filter--deceasedName');
  const statsMappedElement = document.querySelector('#stats--mapped');
  const statsTotalElement = document.querySelector('#stats--total');

  let allBurialSites = [];
  let leafletMap = null;
  let markersLayer = null;

  // Initialize Leaflet map
  function initializeMap() {
    if (leafletMap === null) {
      leafletMap = new L.Map(mapElement, {
        scrollWheelZoom: true,
        center: [43.6532, -79.3832], // Default center (Toronto)
        zoom: 13
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
        
        if (contract.isPreneed === 1) {
          hasActivePreneed = true;
        } else {
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
    
    let html = `<div class="content is-small">
      <p class="has-text-weight-bold mb-2">
        <a href="${siteUrl}" target="_blank" rel="noopener">
          ${cityssm.escapeHTML(site.burialSiteName || 'Unnamed Site')}
        </a>
      </p>`;

    if (site.contracts && site.contracts.length > 0) {
      html += '<p class="mb-1"><strong>Active/Future Contracts:</strong></p><ul class="mb-0">';
      
      for (const contract of site.contracts) {
        const contractUrl = sunrise.getContractUrl(contract.contractId);
        const deceasedText = contract.deceasedNames && contract.deceasedNames.length > 0
          ? ' - ' + cityssm.escapeHTML(contract.deceasedNames.join(', '))
          : '';
        
        html += `<li class="is-size-7">
          <a href="${contractUrl}" target="_blank" rel="noopener">
            ${cityssm.escapeHTML(contract.contractNumber || contract.contractId)}
          </a>
          - ${cityssm.escapeHTML(contract.contractType)}${deceasedText}
        </li>`;
      }
      
      html += '</ul>';
    } else {
      html += '<p class="is-size-7 has-text-grey-light">No active contracts</p>';
    }

    html += '</div>';
    return html;
  }

  // Filter burial sites by deceased name
  function filterBurialSites() {
    const deceasedNameFilter = deceasedNameFilterElement.value.toLowerCase().trim();
    
    if (deceasedNameFilter === '') {
      return allBurialSites;
    }

    return allBurialSites.filter(site => {
      if (!site.contracts || site.contracts.length === 0) {
        return false;
      }

      return site.contracts.some(contract => {
        if (!contract.deceasedNames || contract.deceasedNames.length === 0) {
          return false;
        }

        return contract.deceasedNames.some(name => 
          name.toLowerCase().includes(deceasedNameFilter)
        );
      });
    });
  }

  // Render burial sites on the map
  function renderMap() {
    if (markersLayer === null) {
      return;
    }

    // Clear existing markers
    markersLayer.clearLayers();

    const filteredSites = filterBurialSites();
    
    if (filteredSites.length === 0) {
      return;
    }

    // Get current date for contract status checks
    const currentDate = Math.floor(Date.now() / 86400000); // Date as integer (days since epoch)

    const bounds = [];

    for (const site of filteredSites) {
      if (site.burialSiteLatitude === null || site.burialSiteLongitude === null) {
        continue;
      }

      const coords = [site.burialSiteLatitude, site.burialSiteLongitude];
      bounds.push(coords);

      const color = getMarkerColor(site.contracts || [], currentDate);
      
      const marker = new L.CircleMarker(coords, {
        radius: 8,
        fillColor: color,
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
      });

      marker.bindPopup(createPopupContent(site));
      marker.addTo(markersLayer);
    }

    // Fit map to show all markers
    if (bounds.length > 0) {
      leafletMap.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16
      });
    }
  }

  // Load burial sites for selected cemetery
  function loadBurialSites() {
    const cemeteryId = cemeterySelectElement.value;

    if (cemeteryId === '') {
      allBurialSites = [];
      if (markersLayer !== null) {
        markersLayer.clearLayers();
      }
      statsMappedElement.textContent = '0';
      statsTotalElement.textContent = '0';
      return;
    }

    cityssm.postJSON(
      `${sunrise.urlPrefix}/burialSites/doGetBurialSitesForMap`,
      { cemeteryId },
      (responseJSON) => {
        if (responseJSON.success) {
          allBurialSites = responseJSON.burialSites || [];
          
          // Update stats
          const mappedCount = allBurialSites.length;
          statsMappedElement.textContent = mappedCount.toString();
          
          // For now, we'll show the mapped count as total since we only fetch sites with coordinates
          statsTotalElement.textContent = mappedCount.toString();
          
          renderMap();
        } else {
          cityssm.alertModal(
            'Error Loading Burial Sites',
            responseJSON.errorMessage || 'An error occurred while loading burial sites.',
            'OK',
            'danger'
          );
        }
      }
    );
  }

  // Initialize
  initializeMap();

  // Event listeners
  cemeterySelectElement.addEventListener('change', loadBurialSites);
  
  let deceasedNameTimeout;
  deceasedNameFilterElement.addEventListener('input', () => {
    clearTimeout(deceasedNameTimeout);
    deceasedNameTimeout = setTimeout(() => {
      renderMap();
    }, 300);
  });

  // Load initial cemetery if provided
  if (initialCemeteryId !== null) {
    loadBurialSites();
  }
})();

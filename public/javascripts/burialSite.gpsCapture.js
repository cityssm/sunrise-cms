;
(() => {
    const sunrise = exports.sunrise;
    const coordinatePrecision = 8;
    const maxDeceasedNames = 3;
    let allBurialSites = [];
    const gpsStatusElement = document.querySelector('#gps-status');
    const gpsStatusTextElement = document.querySelector('#gps-status-text');
    const gpsAccuracyElement = document.querySelector('#gps-accuracy');
    const gpsAccuracyTextElement = gpsAccuracyElement.querySelector('span');
    const filtersFormElement = document.querySelector('#form--filters');
    const burialSitesContainerElement = document.querySelector('#container--burialSites');
    let currentPosition;
    let watchId;
    // Initialize GPS
    function initializeGPS() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
        if (!navigator.geolocation) {
            gpsStatusElement.className = 'notification is-danger';
            gpsStatusTextElement.textContent =
                'GPS not supported by this device/browser';
            return;
        }
        gpsStatusElement.className = 'notification is-warning';
        gpsStatusTextElement.textContent = 'Requesting GPS permission...';
        const options = {
            enableHighAccuracy: true,
            maximumAge: 30_000,
            timeout: 10_000
        };
        // Watch position for continuous updates
        // eslint-disable-next-line sonarjs/no-intrusive-permissions
        watchId = navigator.geolocation.watchPosition((position) => {
            currentPosition = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };
            gpsStatusElement.className = 'notification is-success';
            gpsStatusTextElement.textContent = 'GPS active and ready';
            gpsAccuracyElement.style.display = 'block';
            gpsAccuracyTextElement.textContent = Math.round(currentPosition.accuracy).toString();
        }, (error) => {
            gpsStatusElement.className = 'notification is-danger';
            switch (error.code) {
                case error.PERMISSION_DENIED: {
                    gpsStatusTextElement.textContent =
                        'GPS permission denied. Please enable location access.';
                    break;
                }
                case error.POSITION_UNAVAILABLE: {
                    gpsStatusTextElement.textContent = 'GPS position unavailable.';
                    break;
                }
                case error.TIMEOUT: {
                    gpsStatusTextElement.textContent = 'GPS request timed out.';
                    break;
                }
                default: {
                    gpsStatusTextElement.textContent = 'Unknown GPS error occurred.';
                    break;
                }
            }
        }, options);
    }
    // Search for burial sites using AJAX
    function searchBurialSites() {
        const formData = new FormData(filtersFormElement);
        const cemeteryId = formData.get('cemeteryId');
        // Cemetery is required
        if (cemeteryId === null) {
            burialSitesContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">Select a cemetery to view burial sites.</p>
      </div>`;
            return;
        }
        // Show loading message
        burialSitesContainerElement.innerHTML = `<div class="message is-info">
      <p class="message-body">
        <span class="icon"><i class="fa-solid fa-spinner fa-pulse"></i></span>
        Searching burial sites...
      </p>
    </div>`;
        const searchData = {
            burialSiteName: formData.get('burialSiteName'),
            cemeteryId,
            hasCoordinates: formData.get('hasCoordinates')
        };
        cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doSearchBurialSitesForGPS`, searchData, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success && responseJSON.burialSites !== undefined) {
                allBurialSites = responseJSON.burialSites;
                renderBurialSites();
            }
            else {
                burialSitesContainerElement.innerHTML = `<div class="message is-danger">
            <p class="message-body">${cityssm.escapeHTML(responseJSON.errorMessage ?? 'Failed to search burial sites.')}</p>
          </div>`;
            }
        });
    }
    // Capture GPS coordinates for a burial site
    function captureCoordinates(burialSiteId) {
        if (currentPosition === null || currentPosition === undefined) {
            bulmaJS.alert({
                contextualColorName: 'danger',
                title: 'GPS Not Ready',
                message: 'GPS coordinates are not available. Please wait for GPS to initialize.'
            });
            return;
        }
        const captureButton = document.querySelector(`#capture-${burialSiteId}`);
        const originalText = captureButton.innerHTML;
        captureButton.disabled = true;
        captureButton.innerHTML =
            '<span class="icon"><i class="fa-solid fa-spinner fa-pulse"></i></span><span>Capturing...</span>';
        // Update burial site with current GPS coordinates
        const updateData = {
            burialSiteId,
            burialSiteLatitude: currentPosition.latitude.toFixed(coordinatePrecision),
            burialSiteLongitude: currentPosition.longitude.toFixed(coordinatePrecision)
        };
        cityssm.postJSON(`${sunrise.urlPrefix}/burialSites/doUpdateBurialSiteLatitudeLongitude`, updateData, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            captureButton.disabled = false;
            if (responseJSON.success) {
                captureButton.innerHTML =
                    '<span class="icon"><i class="fa-solid fa-check"></i></span><span>Captured!</span>';
                captureButton.classList.add('is-success');
                captureButton.classList.remove('is-primary');
                // Update the displayed coordinates
                const coordsElement = document.querySelector(`#coords-${burialSiteId}`);
                // eslint-disable-next-line no-unsanitized/property
                coordsElement.innerHTML = `<strong>Lat:</strong> ${currentPosition?.latitude.toFixed(coordinatePrecision)}<br />
            <strong>Lng:</strong> ${currentPosition?.longitude.toFixed(coordinatePrecision)}<br />
            <span class="has-text-success">
              <small>Just captured (±${Math.round(currentPosition?.accuracy ?? 0)}m)</small>
            </span>`;
                // Update the burial site data in memory
                const siteIndex = allBurialSites.findIndex((site) => site.burialSiteId === burialSiteId);
                if (siteIndex !== -1) {
                    // eslint-disable-next-line security/detect-object-injection
                    allBurialSites[siteIndex].burialSiteLatitude =
                        // eslint-disable-next-line unicorn/no-null
                        currentPosition?.latitude ?? null;
                    // eslint-disable-next-line security/detect-object-injection
                    allBurialSites[siteIndex].burialSiteLongitude =
                        // eslint-disable-next-line unicorn/no-null
                        currentPosition?.longitude ?? null;
                }
            }
            else {
                // eslint-disable-next-line no-unsanitized/property
                captureButton.innerHTML = originalText;
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Capture Failed',
                    message: responseJSON.errorMessage ??
                        'Failed to capture coordinates. Please try again.'
                });
            }
        });
    }
    // Render the filtered burial sites
    function renderBurialSites() {
        if (allBurialSites.length === 0) {
            burialSitesContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">No burial sites match the current filters.</p>
      </div>`;
            return;
        }
        let html = '<div class="columns is-multiline">';
        for (const site of allBurialSites) {
            const hasCoords = site.burialSiteLatitude !== null && site.burialSiteLongitude !== null;
            const coordsHtml = hasCoords
                ? `<strong>Latitude:</strong> ${site.burialSiteLatitude?.toFixed(coordinatePrecision)}<br>
           <strong>Longitude:</strong> ${site.burialSiteLongitude?.toFixed(coordinatePrecision)}`
                : '<span class="has-text-grey">No coordinates</span>';
            // Build interment names display
            let intermentNamesHtml = '';
            if (site.deceasedNames !== undefined && site.deceasedNames.length > 0) {
                const names = site.deceasedNames.slice(0, maxDeceasedNames);
                intermentNamesHtml = `<div class="is-size-7 has-text-grey-dark mt-2">
          <span class="icon-text">
            <span class="icon is-small">
              <i class="fa-solid fa-users"></i>
            </span>
            <span>${cityssm.escapeHTML(names.join(', '))}${site.deceasedNames.length > maxDeceasedNames ? ` +${site.deceasedNames.length - maxDeceasedNames} more` : ''}</span>
          </span>
        </div>`;
            }
            html += `<div class="column is-one-third-desktop is-half-tablet">
        <div class="card">
          <div class="card-content">
            <div class="content">
              <p class="title is-6">
                <a href="${sunrise.getBurialSiteUrl(site.burialSiteId)}" target="_blank">
                  ${cityssm.escapeHTML(site.burialSiteName === '' ? 'Unnamed Site' : site.burialSiteName)}
                </a>
              </p>
              <p class="subtitle is-7">
                ${cityssm.escapeHTML(site.cemeteryName ?? 'No Cemetery')} - 
                ${cityssm.escapeHTML(site.burialSiteType ?? 'No Type')}
              </p>
              <div id="coords-${site.burialSiteId}" class="is-size-7">
                ${coordsHtml}
              </div>
              ${intermentNamesHtml}
            </div>
          </div>
          <footer class="card-footer">
            <button class="card-footer-item button is-primary is-small" 
                    id="capture-${site.burialSiteId}"
                    data-burial-site-id="${site.burialSiteId}">
              <span class="icon"><i class="fa-solid fa-crosshairs"></i></span>
              <span>Capture GPS</span>
            </button>
          </footer>
        </div>
      </div>`;
        }
        html += '</div>';
        // eslint-disable-next-line no-unsanitized/property
        burialSitesContainerElement.innerHTML = html;
        // Add event listeners to capture buttons
        const captureButtons = burialSitesContainerElement.querySelectorAll('[data-burial-site-id]');
        for (const button of captureButtons) {
            button.addEventListener('click', (event) => {
                const burialSiteId = Number.parseInt(event.currentTarget.dataset.burialSiteId ?? '0', 10);
                captureCoordinates(burialSiteId);
            });
        }
    }
    // Initialize everything
    initializeGPS();
    // Search on form submission
    filtersFormElement.addEventListener('submit', (event) => {
        event.preventDefault();
        searchBurialSites();
    });
    // Also search when filters change (for convenience)
    filtersFormElement.addEventListener('change', () => {
        const formData = new FormData(filtersFormElement);
        const cemeteryId = formData.get('cemeteryId');
        if (cemeteryId !== null) {
            searchBurialSites();
        }
    });
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
        }
    });
})();

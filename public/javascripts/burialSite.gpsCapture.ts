import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { BurialSite } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: {
  sunrise: Sunrise
}

interface GPSPosition {
  latitude: number
  longitude: number
  accuracy: number
}

;(() => {
  const sunrise = exports.sunrise
  let allBurialSites: BurialSite[] = []

  const gpsStatusElement = document.querySelector('#gps-status') as HTMLElement
  const gpsStatusTextElement = document.querySelector(
    '#gps-status-text'
  ) as HTMLElement
  const gpsAccuracyElement = document.querySelector(
    '#gps-accuracy'
  ) as HTMLElement
  const gpsAccuracyTextElement = gpsAccuracyElement.querySelector(
    'span'
  ) as HTMLElement

  const filtersFormElement = document.querySelector(
    '#form--filters'
  ) as HTMLFormElement
  const burialSitesContainerElement = document.querySelector(
    '#container--burialSites'
  ) as HTMLElement

  let currentPosition: GPSPosition | null = null
  let watchId: number | null = null

  // Initialize GPS
  function initializeGPS(): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
    if (!navigator.geolocation) {
      gpsStatusElement.className = 'notification is-danger'
      gpsStatusTextElement.textContent =
        'GPS not supported by this device/browser'
      return
    }

    gpsStatusElement.className = 'notification is-warning'
    gpsStatusTextElement.textContent = 'Requesting GPS permission...'

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 30_000
    }

    // Watch position for continuous updates
    // eslint-disable-next-line sonarjs/no-intrusive-permissions
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        currentPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }

        gpsStatusElement.className = 'notification is-success'
        gpsStatusTextElement.textContent = 'GPS active and ready'
        gpsAccuracyElement.style.display = 'block'
        gpsAccuracyTextElement.textContent = Math.round(
          currentPosition.accuracy
        ).toString()
      },
      (error) => {
        gpsStatusElement.className = 'notification is-danger'

        switch (error.code) {
          case error.PERMISSION_DENIED: {
            gpsStatusTextElement.textContent =
              'GPS permission denied. Please enable location access.'
            break
          }
          case error.POSITION_UNAVAILABLE: {
            gpsStatusTextElement.textContent = 'GPS position unavailable.'
            break
          }
          case error.TIMEOUT: {
            gpsStatusTextElement.textContent = 'GPS request timed out.'
            break
          }
          default: {
            gpsStatusTextElement.textContent = 'Unknown GPS error occurred.'
            break
          }
        }
      },
      options
    )
  }

  // Search for burial sites using AJAX
  function searchBurialSites(): void {
    const formData = new FormData(filtersFormElement)
    const cemeteryId = formData.get('cemeteryId') as string

    // Cemetery is required
    if (!cemeteryId) {
      burialSitesContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">Select a cemetery to view burial sites.</p>
      </div>`
      return
    }

    // Show loading message
    burialSitesContainerElement.innerHTML = `<div class="message is-info">
      <p class="message-body">
        <span class="icon"><i class="fa-solid fa-spinner fa-pulse"></i></span>
        Searching burial sites...
      </p>
    </div>`

    const searchData = {
      cemeteryId: cemeteryId,
      burialSiteTypeId: formData.get('burialSiteTypeId') as string,
      hasCoordinates: formData.get('hasCoordinates') as string,
      burialSiteName: formData.get('burialSiteName') as string
    }

    cityssm.postJSON(
      `${sunrise.urlPrefix}/burialSites/doSearchBurialSitesForGPS`,
      searchData,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          errorMessage?: string
          burialSites?: BurialSite[]
        }

        if (responseJSON.success && responseJSON.burialSites) {
          allBurialSites = responseJSON.burialSites
          renderBurialSites()
        } else {
          burialSitesContainerElement.innerHTML = `<div class="message is-danger">
            <p class="message-body">${cityssm.escapeHTML(responseJSON.errorMessage ?? 'Failed to search burial sites.')}</p>
          </div>`
        }
      }
    )
  }

  // Filter burial sites based on form selections (now used for local filtering after AJAX)
  function getFilteredBurialSites(): BurialSite[] {
    // Since filtering is now done on the server, just return all loaded sites
    return allBurialSites
  }

  // Capture GPS coordinates for a burial site
  function captureCoordinates(burialSiteId: number): void {
    if (!currentPosition) {
      cityssm.alertModal(
        'GPS Not Ready',
        'GPS coordinates are not available. Please wait for GPS to initialize.',
        'OK',
        'danger'
      )
      return
    }

    const captureButton = document.querySelector(
      `#capture-${burialSiteId}`
    ) as HTMLButtonElement
    const originalText = captureButton.innerHTML

    captureButton.disabled = true
    captureButton.innerHTML =
      '<span class="icon"><i class="fa-solid fa-spinner fa-pulse"></i></span><span>Capturing...</span>'

    // Update burial site with current GPS coordinates
    const updateData = {
      burialSiteId: burialSiteId,
      burialSiteLatitude: currentPosition.latitude.toFixed(8),
      burialSiteLongitude: currentPosition.longitude.toFixed(8)
    }

    cityssm.postJSON(
      `${sunrise.urlPrefix}/burialSites/doUpdateBurialSiteLatitudeLongitude`,
      updateData,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          success: boolean
          errorMessage?: string
        }

        captureButton.disabled = false

        if (responseJSON.success) {
          captureButton.innerHTML =
            '<span class="icon"><i class="fa-solid fa-check"></i></span><span>Captured!</span>'
          captureButton.className = 'button is-success is-small'

          // Update the displayed coordinates
          const coordsElement = document.querySelector(
            `#coords-${burialSiteId}`
          ) as HTMLElement

          // eslint-disable-next-line no-unsanitized/property
          coordsElement.innerHTML = `<strong>Lat:</strong> ${currentPosition?.latitude.toFixed(6)}<br>
            <strong>Lng:</strong> ${currentPosition?.longitude.toFixed(6)}<br>
            <span class="has-text-success"><small>Just captured (±${Math.round(currentPosition?.accuracy ?? 0)}m)</small></span>`

          // Update the burial site data in memory
          const siteIndex = allBurialSites.findIndex(
            (site) => site.burialSiteId === burialSiteId
          )

          if (siteIndex !== -1) {
            allBurialSites[siteIndex].burialSiteLatitude =
              currentPosition!.latitude
            allBurialSites[siteIndex].burialSiteLongitude =
              currentPosition!.longitude
          }
        } else {
          captureButton.innerHTML = originalText

          cityssm.alertModal(
            'Capture Failed',
            responseJSON.errorMessage ??
              'Failed to capture coordinates. Please try again.',
            'OK',
            'danger'
          )
        }
      }
    )
  }

  // Render the filtered burial sites
  function renderBurialSites(): void {
    const filteredSites = getFilteredBurialSites()

    if (filteredSites.length === 0) {
      burialSitesContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">No burial sites match the current filters.</p>
      </div>`
      return
    }

    let html = '<div class="columns is-multiline">'

    for (const site of filteredSites) {
      const hasCoords = site.burialSiteLatitude && site.burialSiteLongitude
      const coordsHtml = hasCoords
        ? `<strong>Lat:</strong> ${site.burialSiteLatitude}<br>
           <strong>Lng:</strong> ${site.burialSiteLongitude}`
        : '<span class="has-text-grey">No coordinates</span>'

      // Build interment names display
      let intermentNamesHtml = ''
      if (site.intermentNames && site.intermentNames.length > 0) {
        const names = site.intermentNames.slice(0, 3) // Show max 3 names
        intermentNamesHtml = `<div class="is-size-7 has-text-grey-dark mt-2">
          <span class="icon-text">
            <span class="icon is-small">
              <i class="fa-solid fa-users"></i>
            </span>
            <span><strong>Interred:</strong> ${cityssm.escapeHTML(names.join(', '))}${site.intermentNames.length > 3 ? ` +${site.intermentNames.length - 3} more` : ''}</span>
          </span>
        </div>`
      }

      html += `<div class="column is-one-third-desktop is-half-tablet">
        <div class="card">
          <div class="card-content">
            <div class="content">
              <p class="title is-6">
                <a href="${sunrise.getBurialSiteURL(site.burialSiteId)}" target="_blank">
                  ${cityssm.escapeHTML(site.burialSiteName ?? 'Unnamed Site')}
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
      </div>`
    }

    html += '</div>'

    burialSitesContainerElement.innerHTML = html

    // Add event listeners to capture buttons
    const captureButtons = burialSitesContainerElement.querySelectorAll(
      '[data-burial-site-id]'
    )
    for (const button of captureButtons) {
      button.addEventListener('click', (event) => {
        const burialSiteId = Number.parseInt(
          (event.currentTarget as HTMLElement).dataset.burialSiteId ?? '0',
          10
        )
        captureCoordinates(burialSiteId)
      })
    }
  }

  // Initialize everything
  initializeGPS()

  // Search on form submission
  filtersFormElement.addEventListener('submit', (event) => {
    event.preventDefault()
    searchBurialSites()
  })

  // Also search when filters change (for convenience)
  filtersFormElement.addEventListener('change', () => {
    const formData = new FormData(filtersFormElement)
    const cemeteryId = formData.get('cemeteryId') as string
    if (cemeteryId) {
      searchBurialSites()
    }
  })

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
    }
  })
})()

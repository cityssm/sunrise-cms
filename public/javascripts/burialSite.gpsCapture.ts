import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { BurialSite } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: {
  sunrise: Sunrise
  burialSites: BurialSite[]
}

interface GPSPosition {
  latitude: number
  longitude: number
  accuracy: number
}

;(() => {
  const sunrise = exports.sunrise
  const allBurialSites = exports.burialSites

  const gpsStatusElement = document.querySelector('#gps-status') as HTMLElement
  const gpsStatusTextElement = document.querySelector('#gps-status-text') as HTMLElement
  const gpsAccuracyElement = document.querySelector('#gps-accuracy') as HTMLElement
  const gpsAccuracyTextElement = gpsAccuracyElement.querySelector('span') as HTMLElement

  const filtersFormElement = document.querySelector('#form--filters') as HTMLFormElement
  const burialSitesContainerElement = document.querySelector('#container--burialSites') as HTMLElement

  let currentPosition: GPSPosition | null = null
  let watchId: number | null = null

  // Initialize GPS
  function initializeGPS(): void {
    if (!navigator.geolocation) {
      gpsStatusElement.className = 'notification is-danger'
      gpsStatusTextElement.textContent = 'GPS not supported by this device/browser'
      return
    }

    gpsStatusElement.className = 'notification is-warning'
    gpsStatusTextElement.textContent = 'Requesting GPS permission...'

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    }

    // Watch position for continuous updates
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
        gpsAccuracyTextElement.textContent = Math.round(currentPosition.accuracy).toString()
      },
      (error) => {
        gpsStatusElement.className = 'notification is-danger'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            gpsStatusTextElement.textContent = 'GPS permission denied. Please enable location access.'
            break
          case error.POSITION_UNAVAILABLE:
            gpsStatusTextElement.textContent = 'GPS position unavailable.'
            break
          case error.TIMEOUT:
            gpsStatusTextElement.textContent = 'GPS request timed out.'
            break
          default:
            gpsStatusTextElement.textContent = 'Unknown GPS error occurred.'
            break
        }
      },
      options
    )
  }

  // Filter burial sites based on form selections
  function getFilteredBurialSites(): BurialSite[] {
    const formData = new FormData(filtersFormElement)
    const cemeteryId = formData.get('cemeteryId') as string
    const burialSiteTypeId = formData.get('burialSiteTypeId') as string
    const coordinateStatus = formData.get('coordinateStatus') as string

    return allBurialSites.filter((site) => {
      // Cemetery filter
      if (cemeteryId && site.cemeteryId?.toString() !== cemeteryId) {
        return false
      }

      // Burial site type filter
      if (burialSiteTypeId && site.burialSiteTypeId?.toString() !== burialSiteTypeId) {
        return false
      }

      // Coordinate status filter
      if (coordinateStatus === 'missing') {
        return !site.burialSiteLatitude || !site.burialSiteLongitude
      } else if (coordinateStatus === 'present') {
        return site.burialSiteLatitude && site.burialSiteLongitude
      }

      return true
    })
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

    const captureButton = document.querySelector(`#capture-${burialSiteId}`) as HTMLButtonElement
    const originalText = captureButton.innerHTML
    
    captureButton.disabled = true
    captureButton.innerHTML = '<span class="icon"><i class="fa-solid fa-spinner fa-pulse"></i></span><span>Capturing...</span>'

    // Update burial site with current GPS coordinates
    const updateData = {
      burialSiteId: burialSiteId,
      burialSiteLatitude: currentPosition.latitude.toFixed(8),
      burialSiteLongitude: currentPosition.longitude.toFixed(8),
      // We need to preserve existing data, so we'll get the current site data
      ...getCurrentBurialSiteData(burialSiteId)
    }

    cityssm.postJSON(
      `${sunrise.urlPrefix}/burialSites/doUpdateBurialSite`,
      updateData,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as { success: boolean; errorMessage?: string }
        
        captureButton.disabled = false
        
        if (responseJSON.success) {
          captureButton.innerHTML = '<span class="icon"><i class="fa-solid fa-check"></i></span><span>Captured!</span>'
          captureButton.className = 'button is-success is-small'
          
          // Update the displayed coordinates
          const coordsElement = document.querySelector(`#coords-${burialSiteId}`) as HTMLElement
          coordsElement.innerHTML = `<strong>Lat:</strong> ${currentPosition!.latitude.toFixed(6)}<br>
                                     <strong>Lng:</strong> ${currentPosition!.longitude.toFixed(6)}<br>
                                     <span class="has-text-success"><small>Just captured (±${Math.round(currentPosition!.accuracy)}m)</small></span>`

          // Update the burial site data in memory
          const siteIndex = allBurialSites.findIndex(site => site.burialSiteId === burialSiteId)
          if (siteIndex !== -1) {
            allBurialSites[siteIndex].burialSiteLatitude = currentPosition!.latitude
            allBurialSites[siteIndex].burialSiteLongitude = currentPosition!.longitude
          }
        } else {
          captureButton.innerHTML = originalText
          cityssm.alertModal(
            'Capture Failed',
            responseJSON.errorMessage || 'Failed to capture coordinates. Please try again.',
            'OK',
            'danger'
          )
        }
      }
    )
  }

  // Get current burial site data to preserve existing fields
  function getCurrentBurialSiteData(burialSiteId: number): any {
    const site = allBurialSites.find(s => s.burialSiteId === burialSiteId)
    if (!site) return {}

    return {
      burialSiteNameSegment1: site.burialSiteNameSegment1 || '',
      burialSiteNameSegment2: site.burialSiteNameSegment2 || '',
      burialSiteNameSegment3: site.burialSiteNameSegment3 || '',
      burialSiteNameSegment4: site.burialSiteNameSegment4 || '',
      burialSiteNameSegment5: site.burialSiteNameSegment5 || '',
      burialSiteStatusId: site.burialSiteStatusId || 0,
      burialSiteTypeId: site.burialSiteTypeId || 0,
      bodyCapacity: site.bodyCapacity || 0,
      crematedCapacity: site.crematedCapacity || 0,
      burialSiteImage: site.burialSiteImage || '',
      cemeteryId: site.cemeteryId || 0,
      cemeterySvgId: site.cemeterySvgId || ''
    }
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

      html += `<div class="column is-one-third-desktop is-half-tablet">
        <div class="card">
          <div class="card-content">
            <div class="content">
              <p class="title is-6">
                <a href="${sunrise.getBurialSiteURL(site.burialSiteId)}" target="_blank">
                  ${cityssm.escapeHTML(site.burialSiteName || 'Unnamed Site')}
                </a>
              </p>
              <p class="subtitle is-7">
                ${cityssm.escapeHTML(site.cemeteryName || 'No Cemetery')} - 
                ${cityssm.escapeHTML(site.burialSiteType || 'No Type')}
              </p>
              <div id="coords-${site.burialSiteId}" class="is-size-7">
                ${coordsHtml}
              </div>
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
    const captureButtons = burialSitesContainerElement.querySelectorAll('[data-burial-site-id]')
    for (const button of captureButtons) {
      button.addEventListener('click', (event) => {
        const burialSiteId = Number.parseInt(
          (event.currentTarget as HTMLElement).dataset.burialSiteId!,
          10
        )
        captureCoordinates(burialSiteId)
      })
    }
  }

  // Initialize everything
  initializeGPS()
  renderBurialSites()

  // Add filter event listeners
  filtersFormElement.addEventListener('change', renderBurialSites)

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
    }
  })
})()
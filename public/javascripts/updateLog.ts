import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { RecordUpdateLog } from '../../database/getRecordUpdateLog.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal

declare const exports: {
  sunrise: Sunrise
}
;(() => {
  const sunrise = exports.sunrise

  const limit = 50
  let offset = 0
  let sortBy: 'recordUpdate_timeMillis' | 'recordCreate_timeMillis' = 'recordUpdate_timeMillis'
  let sortDirection: 'asc' | 'desc' = 'desc'

  const recordTypeFilterElement = document.querySelector(
    '#filter--recordType'
  ) as HTMLSelectElement

  const limitInputElement = document.querySelector(
    '#input--limit'
  ) as HTMLInputElement

  const updateLogTableElement = document.querySelector(
    '#table--updateLog'
  ) as HTMLTableElement

  const loadingElement = document.querySelector(
    '#loading--updateLog'
  ) as HTMLDivElement

  const loadMoreButtonElement = document.querySelector(
    '#button--updateLogLoadMore'
  ) as HTMLButtonElement

  const exportButtonElement = document.querySelector(
    '#button--exportUpdateLog'
  ) as HTMLButtonElement

  function getRecordSpecificElements(logEntry: RecordUpdateLog): {
    recordTypeHTML: string
    recordURL: string
  } {
    let recordTypeHTML = ''
    let recordURL = ''

    switch (logEntry.recordType) {
      case 'contract': {
        recordTypeHTML = `<span class="icon" title="Contract">
          <i class="fa-solid fa-file-contract"></i>
          </span>`

        recordURL = sunrise.getContractURL(logEntry.recordId)

        break
      }
      case 'contractTransactions': {
        recordTypeHTML = `<span class="icon" title="Contract Transaction">
          <i class="fa-solid fa-money-bill-1"></i>
          </span>`

        recordURL = sunrise.getContractURL(logEntry.recordId)

        break
      }
      case 'contractFee': {
        recordTypeHTML = `<span class="icon" title="Contract Fee">
          <span class="fa-layers fa-fw">
            <i class="fa-solid fa-file-contract"></i>
            <i class="fa-solid fa-dollar-sign" data-fa-transform="shrink-6 down-4 right-4"></i>
          </span>
          </span>`

        recordURL = sunrise.getContractURL(logEntry.recordId)

        break
      }
      case 'contractComment': {
        recordTypeHTML = `<span class="icon" title="Contract Comment">
          <span class="fa-layers fa-fw">
            <i class="fa-solid fa-file-contract"></i>
            <i class="fa-solid fa-comment" data-fa-transform="shrink-6 down-4 right-4"></i>
          </span>
          </span>`

        recordURL = sunrise.getContractURL(logEntry.recordId)

        break
      }
      case 'workOrder': {
        recordTypeHTML = `<span class="icon" title="Work Order">
            <i class="fa-solid fa-hard-hat"></i>
          </span>`

        recordURL = sunrise.getWorkOrderURL(logEntry.recordId)

        break
      }

      case 'workOrderMilestone': {
        recordTypeHTML = `<span class="icon" title="Work Order Milestone">
            <span class="fa-layers fa-fw">
              <i class="fa-solid fa-hard-hat"></i>
              <i class="fa-solid fa-clock" data-fa-glow="10" data-fa-transform="shrink-6 down-4 right-4"></i>
            </span>

          </span>`

        recordURL = sunrise.getWorkOrderURL(logEntry.recordId)

        break
      }
      case 'workOrderComment': {
        recordTypeHTML = `<span class="icon" title="Work Order Comment">
          <span class="fa-layers fa-fw">
            <i class="fa-solid fa-hard-hat"></i>
            <i class="fa-solid fa-comment" data-fa-transform="shrink-6 down-4 right-4"></i>
          </span>
          </span>`

        recordURL = sunrise.getWorkOrderURL(logEntry.recordId)

        break
      }
      case 'burialSite': {
        recordTypeHTML = `<span class="icon" title="Burial Site">
          <i class="fa-solid fa-cross"></i>
          </span>`

        recordURL = sunrise.getBurialSiteURL(logEntry.recordId)

        break
      }
      case 'burialSiteComment': {
        recordTypeHTML = `<span class="icon" title="Burial Site Comment">
          <span class="fa-layers fa-fw">
            <i class="fa-solid fa-cross"></i>
            <i class="fa-solid fa-comment" data-fa-transform="shrink-6 down-4 right-4"></i>
          </span>
          </span>`

        recordURL = sunrise.getBurialSiteURL(logEntry.recordId)

        break
      }
      case 'fee': {
        recordTypeHTML = `<span class="icon" title="Fee">
          <i class="fa-solid fa-tags"></i>
          </span>`

        recordURL = '#' // No direct URL for fees yet

        break
      }
      case 'comments': {
        recordTypeHTML = `<span class="icon" title="Comment">
          <i class="fa-solid fa-comments"></i>
          </span>`

        recordURL = '#'

        break
      }
    }

    return { recordTypeHTML, recordURL }
  }

  function renderUpdateLog(updateLog: RecordUpdateLog[]): void {
    const tableBodyElement = updateLogTableElement.querySelector(
      'tbody'
    ) as HTMLTableSectionElement

    for (const logEntry of updateLog) {
      const rowElement = document.createElement('tr')

      const { recordTypeHTML, recordURL } = getRecordSpecificElements(logEntry)

      const logEntryUpdateDate = new Date(logEntry.recordUpdate_timeMillis)
      const logEntryCreateDate = new Date(logEntry.recordCreate_timeMillis)

      // eslint-disable-next-line no-unsanitized/property
      rowElement.innerHTML = `<td class="has-text-centered">${recordTypeHTML}</td>
        <td>
          <a href="${recordURL}" title="Open Record" target="_blank">${logEntry.displayRecordId}</a>
        </td>
        <td>${logEntry.recordDescription}</td>
        <td>
          <span class="is-nowrap">
            ${cityssm.dateToString(logEntryUpdateDate)} ${cityssm.dateToTimeString(logEntryUpdateDate)}
          </span><br />
          <span class="is-size-7">
            <span class="icon is-small">
              ${
                logEntry.updateType === 'create'
                  ? '<i class="fa-solid fa-star"></i>'
                  : '<i class="fa-solid fa-pencil-alt"></i>'
              }
            </span>
            <span>${logEntry.recordUpdate_userName}</span>
          </span>
        </td>
        <td>
          <span class="is-nowrap">
            ${cityssm.dateToString(logEntryCreateDate)} ${cityssm.dateToTimeString(logEntryCreateDate)}
          </span><br />
          <span class="is-size-7">
            <span class="icon is-small">
              <i class="fa-solid fa-star"></i>
            </span>
            <span>${logEntry.recordCreate_userName}</span>
          </span>
        </td>`

      tableBodyElement.append(rowElement)
    }

    loadingElement.classList.add('is-hidden')
    tableBodyElement.closest('table')?.classList.remove('is-hidden')
  }

  function getUpdateLog(): void {
    loadingElement.classList.remove('is-hidden')

    const currentLimit = Math.min(Number.parseInt(limitInputElement.value, 10) || 50, 200)

    cityssm.postJSON(
      `${sunrise.urlPrefix}/dashboard/doGetRecordUpdateLog`,
      {
        limit: currentLimit,
        offset,
        recordType: recordTypeFilterElement.value,
        sortBy,
        sortDirection
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as { updateLog: RecordUpdateLog[] }

        if (responseJSON.updateLog.length < currentLimit) {
          loadMoreButtonElement.classList.add('is-hidden')
        } else {
          loadMoreButtonElement.classList.remove('is-hidden')
        }

        renderUpdateLog(responseJSON.updateLog)
      }
    )
  }

  loadMoreButtonElement.addEventListener('click', () => {
    loadMoreButtonElement.classList.add('is-hidden')

    const currentLimit = Math.min(Number.parseInt(limitInputElement.value, 10) || 50, 200)
    offset += currentLimit
    getUpdateLog()
  })

  recordTypeFilterElement.addEventListener('change', () => {
    offset = 0
    loadMoreButtonElement.classList.add('is-hidden')
    updateLogTableElement.querySelector('tbody')?.replaceChildren()
    getUpdateLog()
  })

  limitInputElement.addEventListener('change', () => {
    offset = 0
    loadMoreButtonElement.classList.add('is-hidden')
    updateLogTableElement.querySelector('tbody')?.replaceChildren()
    getUpdateLog()
  })

  // Add sorting functionality
  function addSortClickHandler(headerElement: HTMLElement, sortColumn: 'recordUpdate_timeMillis' | 'recordCreate_timeMillis'): void {
    headerElement.style.cursor = 'pointer'
    headerElement.classList.add('is-clickable')
    
    headerElement.addEventListener('click', () => {
      if (sortBy === sortColumn) {
        sortDirection = sortDirection === 'desc' ? 'asc' : 'desc'
      } else {
        sortBy = sortColumn
        sortDirection = 'desc'
      }
      
      offset = 0
      loadMoreButtonElement.classList.add('is-hidden')
      updateLogTableElement.querySelector('tbody')?.replaceChildren()
      getUpdateLog()
      
      // Update sort indicators
      document.querySelectorAll('#table--updateLog th[data-sort]').forEach(th => {
        th.classList.remove('has-text-primary')
        const icon = th.querySelector('.fa-sort, .fa-sort-up, .fa-sort-down')
        if (icon) {
          icon.className = 'fa-solid fa-sort'
        }
      })
      
      headerElement.classList.add('has-text-primary')
      const icon = headerElement.querySelector('.fa-sort, .fa-sort-up, .fa-sort-down')
      if (icon) {
        icon.className = `fa-solid fa-sort-${sortDirection === 'desc' ? 'down' : 'up'}`
      }
    })
  }

  const updateHeader = document.querySelector('#header--updated') as HTMLElement
  const createHeader = document.querySelector('#header--created') as HTMLElement
  
  if (updateHeader) {
    addSortClickHandler(updateHeader, 'recordUpdate_timeMillis')
  }
  if (createHeader) {
    addSortClickHandler(createHeader, 'recordCreate_timeMillis')
  }

  // Add export functionality
  exportButtonElement?.addEventListener('click', () => {
    const recordType = recordTypeFilterElement.value
    window.open(`${sunrise.urlPrefix}/dashboard/exportRecordUpdateLog?recordType=${encodeURIComponent(recordType)}`, '_blank')
  })

  getUpdateLog()
})()

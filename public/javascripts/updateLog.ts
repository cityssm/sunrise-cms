/* eslint-disable runtime-cleanup/no-unmanaged-event-listeners */
import type { CityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { RecordUpdateLog } from '../../database/getRecordUpdateLog.js'
import type { DoGetRecordUpdateLogResponse } from '../../handlers/dashboardPost/doGetRecordUpdateLog.js'

import type { Sunrise } from './types.js'

declare const cityssm: CityssmGlobal

declare const exports: {
  sunrise: Sunrise
}

{
  const sunrise = exports.sunrise

  const limitElement = document.querySelector(
    '#filter--limit'
  ) as HTMLSelectElement

  let offset = 0

  let sortBy: 'recordCreate_timeMillis' | 'recordUpdate_timeMillis' =
    'recordUpdate_timeMillis'
  let sortDirection: 'asc' | 'desc' = 'desc'

  const recordTypeFilterElement = document.querySelector(
    '#filter--recordType'
  ) as HTMLSelectElement

  const updateLogTableElement = document.querySelector(
    '#table--updateLog'
  ) as HTMLTableElement

  const loadingElement = document.querySelector(
    '#loading--updateLog'
  ) as HTMLDivElement

  const loadMoreButtonElement = document.querySelector(
    '#button--updateLogLoadMore'
  ) as HTMLButtonElement

  function getRecordSpecificElements(logEntry: RecordUpdateLog): {
    recordTypeHTML: string
    recordUrl: string
  } {
    let recordTypeHTML = ''
    let recordUrl = ''

    switch (logEntry.recordType) {
      case 'burialSite': {
        recordTypeHTML = /* html */ `
          <span title="Burial Site">
            <i class="fa-solid fa-2x fa-map-pin"></i>
          </span>
        `

        recordUrl = sunrise.getBurialSiteUrl(logEntry.recordId)

        break
      }
      case 'burialSiteComment': {
        recordTypeHTML = /* html */ `
          <span title="Burial Site Comment">
            <span class="fa-layers fa-2x fa-fw">
              <i class="fa-solid fa-map-pin" data-fa-transform="left-4"></i>
              <i class="fa-solid fa-comment" data-fa-glow="10" data-fa-transform="shrink-6 down-4 right-4"></i>
            </span>
          </span>
        `

        recordUrl = sunrise.getBurialSiteUrl(logEntry.recordId)

        break
      }
      case 'comments': {
        recordTypeHTML = /* html */ `
          <span title="Comment">
            <i class="fa-solid fa-2x fa-comments"></i>
          </span>
        `

        recordUrl = '#'

        break
      }
      case 'contract': {
        recordTypeHTML = /* html */ `
          <span title="Contract">
            <i class="fa-solid fa-2x fa-file-contract"></i>
          </span>
        `

        recordUrl = sunrise.getContractUrl(logEntry.recordId)

        break
      }
      case 'contractComment': {
        recordTypeHTML = /* html */ `
          <span title="Contract Comment">
            <span class="fa-layers fa-2x fa-fw">
              <i class="fa-solid fa-file-contract"></i>
              <i class="fa-solid fa-comment" data-fa-glow="10" data-fa-transform="shrink-6 down-5 right-4"></i>
            </span>
          </span>
        `

        recordUrl = sunrise.getContractUrl(logEntry.recordId)

        break
      }

      case 'contractFee': {
        recordTypeHTML = /* html */ `
          <span title="Contract Fee">
            <span class="fa-layers fa-2x fa-fw">
              <i class="fa-solid fa-file-contract"></i>
              <i class="fa-solid fa-dollar-sign" data-fa-glow="10" data-fa-transform="shrink-6 down-4 right-4"></i>
            </span>
          </span>
        `

        recordUrl = sunrise.getContractUrl(logEntry.recordId)

        break
      }
      case 'contractTransactions': {
        recordTypeHTML = /* html */ `
          <span title="Contract Transaction">
            <i class="fa-solid fa-2x fa-money-bill-1"></i>
          </span>
        `

        recordUrl = sunrise.getContractUrl(logEntry.recordId)

        break
      }

      case 'workOrder': {
        recordTypeHTML = /* html */ `
          <span title="Work Order">
            <i class="fa-solid fa-2x fa-hard-hat"></i>
          </span>
        `

        recordUrl = sunrise.getWorkOrderUrl(logEntry.recordId)

        break
      }
      case 'workOrderComment': {
        recordTypeHTML = /* html */ `
          <span title="Work Order Comment">
            <span class="fa-layers fa-2x fa-fw">
              <i class="fa-solid fa-hard-hat"></i>
              <i class="fa-solid fa-comment" data-fa-glow="10" data-fa-transform="shrink-6 down-4 right-4"></i>
            </span>
          </span>
        `

        recordUrl = sunrise.getWorkOrderUrl(logEntry.recordId)

        break
      }
      case 'workOrderMilestone': {
        recordTypeHTML = /* html */ `
          <span title="Work Order Milestone">
            <span class="fa-layers fa-2x fa-fw">
              <i class="fa-solid fa-hard-hat"></i>
              <i class="fa-solid fa-clock" data-fa-glow="10" data-fa-transform="shrink-6 down-4 right-4"></i>
            </span>
          </span>
        `

        recordUrl = sunrise.getWorkOrderUrl(logEntry.recordId)

        break
      }

      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      // no default
    }

    return { recordTypeHTML, recordUrl }
  }

  function renderUpdateLog(updateLog: RecordUpdateLog[]): void {
    const tableBodyElement = updateLogTableElement.querySelector(
      'tbody'
    ) as HTMLTableSectionElement

    for (const logEntry of updateLog) {
      const rowElement = document.createElement('tr')

      const { recordTypeHTML, recordUrl } = getRecordSpecificElements(logEntry)

      const logEntryUpdateDate = new Date(logEntry.recordUpdate_timeMillis)
      const logEntryCreateDate = new Date(logEntry.recordCreate_timeMillis)

      // eslint-disable-next-line browser-security/no-innerhtml
      rowElement.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <td class="has-text-centered">${recordTypeHTML}</td>
        `
      )

      // eslint-disable-next-line browser-security/no-innerhtml
      rowElement.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <td>
            <a href="${recordUrl}" title="Open Record" target="_blank">${cityssm.escapeHTML(logEntry.displayRecordId)}</a>
          </td>
        `
      )

      rowElement.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <td>${cityssm.escapeHTML(logEntry.recordDescription)}</td>
        `
      )

      // eslint-disable-next-line browser-security/no-innerhtml
      rowElement.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <td>
            <span class="is-nowrap">
              ${cityssm.escapeHTML(cityssm.dateToString(logEntryUpdateDate))}
              ${cityssm.escapeHTML(cityssm.dateToTimeString(logEntryUpdateDate))}
            </span><br />
            <span class="is-size-7">
              <span class="icon is-small">
                ${
                  logEntry.updateType === 'create'
                    ? '<i class="fa-solid fa-star"></i>'
                    : '<i class="fa-solid fa-pencil-alt"></i>'
                }
              </span>
              <span>${cityssm.escapeHTML(logEntry.recordUpdate_username)}</span>
            </span>
          </td>
        `
      )

      rowElement.insertAdjacentHTML(
        'beforeend',
        /* html */ `
          <td>
            <span class="is-nowrap">
              ${cityssm.escapeHTML(cityssm.dateToString(logEntryCreateDate))}
              ${cityssm.escapeHTML(cityssm.dateToTimeString(logEntryCreateDate))}
            </span><br />
            <span class="is-size-7">
              <span class="icon is-small">
                <i class="fa-solid fa-star"></i>
              </span>
              <span>${cityssm.escapeHTML(logEntry.recordCreate_username)}</span>
            </span>
          </td>
        `
      )

      tableBodyElement.append(rowElement)
    }

    loadingElement.classList.add('is-hidden')
    tableBodyElement.closest('table')?.classList.remove('is-hidden')
  }

  function getUpdateLog(): void {
    loadingElement.classList.remove('is-hidden')

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const currentLimit = Math.min(Math.trunc(Number(limitElement.value)), 100)

    cityssm.postJSON(
      `${sunrise.urlPrefix}/dashboard/doGetRecordUpdateLog`,
      {
        limit: currentLimit,
        offset,
        recordType: recordTypeFilterElement.value,
        sortBy,
        sortDirection
      },
      (responseJSON: DoGetRecordUpdateLogResponse) => {
        loadMoreButtonElement.classList.toggle(
          'is-hidden',
          responseJSON.updateLog.length < currentLimit
        )

        renderUpdateLog(responseJSON.updateLog)
      }
    )
  }

  loadMoreButtonElement.addEventListener('click', () => {
    loadMoreButtonElement.classList.add('is-hidden')

    const currentLimit = Math.min(Math.trunc(Number(limitElement.value)), 200)
    offset += currentLimit
    getUpdateLog()
  })

  recordTypeFilterElement.addEventListener('change', () => {
    offset = 0
    loadMoreButtonElement.classList.add('is-hidden')
    updateLogTableElement.querySelector('tbody')?.replaceChildren()
    getUpdateLog()
  })

  limitElement.addEventListener('change', () => {
    offset = 0
    loadMoreButtonElement.classList.add('is-hidden')
    updateLogTableElement.querySelector('tbody')?.replaceChildren()
    getUpdateLog()
  })

  // Add sorting functionality
  function addSortClickHandler(
    headerElement: HTMLElement,
    sortColumn: 'recordCreate_timeMillis' | 'recordUpdate_timeMillis'
  ): void {
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
      for (const th of document.querySelectorAll(
        '#table--updateLog th[data-sort]'
      )) {
        th.classList.remove('has-background-primary-light')
        const iconContainerElement = th.querySelector('.icon')

        if (iconContainerElement !== null) {
          iconContainerElement.innerHTML = '<i class="fa-solid fa-sort"></i>'
        }
      }

      headerElement.classList.add('has-background-primary-light')

      const iconContainerElement = headerElement.querySelector('.icon')

      if (iconContainerElement !== null) {
        iconContainerElement.innerHTML = /* html */ `
          <i class="fa-solid fa-sort-${sortDirection === 'desc' ? 'down' : 'up'}"></i>
        `
      }
    })
  }

  const updateHeader = document.querySelector('#header--updated')
  const createHeader = document.querySelector('#header--created')

  if (updateHeader !== null) {
    addSortClickHandler(updateHeader as HTMLElement, 'recordUpdate_timeMillis')
  }
  if (createHeader !== null) {
    addSortClickHandler(createHeader as HTMLElement, 'recordCreate_timeMillis')
  }

  getUpdateLog()
}

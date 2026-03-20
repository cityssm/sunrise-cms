import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type { i18n } from 'i18next'

import type { DoGetAuditLogResponse } from '../../handlers/admin-post/doGetAuditLog.js'
import type { DoPurgeAuditLogResponse } from '../../handlers/admin-post/doPurgeAuditLog.js'
import type { AuditLogEntry } from '../../types/record.types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS
declare const i18next: i18n

declare const exports: {
  sunrise: Sunrise
}
;(() => {
  const sunrise = exports.sunrise

  const auditLogContainerElement = document.querySelector(
    '#container--auditLog'
  ) as HTMLElement

  const filterFormElement = document.querySelector(
    '#form--auditLogFilters'
  ) as HTMLFormElement

  const pageLimit = 50

  let currentOffset = 0

  function getUpdateTypeColorClass(updateType: string): string {
    switch (updateType) {
      case 'created': {
        return 'has-background-success-light'
      }
      case 'deleted': {
        return 'has-background-danger-light'
      }
      default: {
        return 'has-background-warning-light'
      }
    }
  }

  function getRecordUrl(
    mainRecordType: string,
    mainRecordId: string
  ): string | undefined {
    switch (mainRecordType) {
      case 'burialSite': {
        return exports.sunrise.getBurialSiteUrl(mainRecordId)
      }
      case 'cemetery': {
        return exports.sunrise.getCemeteryUrl(mainRecordId)
      }
      case 'contract': {
        return exports.sunrise.getContractUrl(mainRecordId)
      }
      case 'funeralHome': {
        return exports.sunrise.getFuneralHomeUrl(mainRecordId)
      }
      case 'workOrder': {
        return exports.sunrise.getWorkOrderUrl(mainRecordId)
      }
      default: {
        return undefined
      }
    }
  }

  const maxValueLength = 100

  function truncateValue(value: string): string {
    if (value.length <= maxValueLength) {
      return value
    }

    return `${value.slice(0, maxValueLength)}\u2026`
  }

  function buildValueCell(rawValue: string | null): string {
    if (rawValue === null || rawValue === 'null') {
      return /* html */ '<em class="has-text-grey-darker">null</em>'
    }

    const escaped = cityssm.escapeHTML(rawValue)
    if (rawValue.length <= maxValueLength) {
      return /* html */ `<code style="word-break:break-all">${escaped}</code>`
    }

    const truncated = cityssm.escapeHTML(truncateValue(rawValue))

    return /* html */ `
      <code title="${escaped}" style="cursor:help;word-break:break-all">
        ${truncated}
      </code>
    `
  }

  function renderAuditLog(responseJSON: DoGetAuditLogResponse): void {
    const { auditLogEntries, count, offset } = responseJSON

    if (auditLogEntries.length === 0) {
      auditLogContainerElement.innerHTML = /* html */ `
        <p class="has-text-grey">
          ${cityssm.escapeHTML(i18next.t('admin:auditLogNoEntries'))}
        </p>
      `
      return
    }

    const rowsHtml = auditLogEntries
      .map((entry: AuditLogEntry) => {
        const logDate = new Date(entry.logMillis)
        const dateString = logDate.toLocaleDateString()
        const timeString = logDate.toLocaleTimeString()

        const recordUrl = getRecordUrl(entry.mainRecordType, entry.mainRecordId)

        return /* html */ `
          <tr class="is-size-7 ${getUpdateTypeColorClass(entry.updateType)}">
            <td>
              ${cityssm.escapeHTML(dateString)}<br />
              <span class="is-size-7">${cityssm.escapeHTML(timeString)}</span>
            </td>
            <td>
              ${cityssm.escapeHTML(entry.mainRecordType)}<br />
              ${
                recordUrl === undefined
                  ? `<span class="is-size-7">${cityssm.escapeHTML(entry.mainRecordId)}</span>`
                  : /* html */ `
                    <a
                      class="has-text-black has-text-weight-semibold is-size-7"
                      href="${cityssm.escapeHTML(recordUrl)}"
                      title="${cityssm.escapeHTML(i18next.t('admin:auditLogViewRecord'))}"
                      target="_blank"
                    >
                      ${cityssm.escapeHTML(entry.mainRecordId)}
                    </a>
                  `
              }
            </td>
            <td>
              ${cityssm.escapeHTML(entry.updateTable)}<br />
              ${
                entry.recordIndex === null
                  ? ''
                  : /* html */ `
                    <span class="is-size-7">
                      ${cityssm.escapeHTML(entry.recordIndex)}
                    </span>
                  `
              }
            </td>
            <td>
              ${cityssm.escapeHTML(entry.updateField)}
            </td>
            <td style="max-width:400px">${buildValueCell(entry.fromValue)}</td>
            <td style="max-width:400px">${buildValueCell(entry.toValue)}</td>
            <td class="is-nowrap">
              ${cityssm.escapeHTML(entry.updateUserName)}
            </td>
          </tr>
        `
      })
      .join('')

    // eslint-disable-next-line no-unsanitized/property
    auditLogContainerElement.innerHTML = /* html */ `
      <div class="table-container">
        <table class="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>${cityssm.escapeHTML(i18next.t('time'))}</th>
              <th>${cityssm.escapeHTML(i18next.t('admin:mainRecordType'))}</th>
              <th>
                ${cityssm.escapeHTML(i18next.t('admin:auditLogTable'))}
              </th>
              <th>
                ${cityssm.escapeHTML(i18next.t('admin:auditLogField'))}
              </th>
              <th>${cityssm.escapeHTML(i18next.t('admin:auditLogFrom'))}</th>
              <th>${cityssm.escapeHTML(i18next.t('admin:auditLogTo'))}</th>
              <th>${cityssm.escapeHTML(i18next.t('admin:userName'))}</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    `

    auditLogContainerElement.insertAdjacentHTML(
      'beforeend',
      sunrise.getSearchResultsPagerHTML(pageLimit, offset, count)
    )

    auditLogContainerElement
      .querySelector("button[data-page='previous']")
      ?.addEventListener('click', () => {
        currentOffset = Math.max(currentOffset - pageLimit, 0)
        fetchAuditLog()
      })

    auditLogContainerElement
      .querySelector("button[data-page='next']")
      ?.addEventListener('click', () => {
        currentOffset += pageLimit
        fetchAuditLog()
      })
  }

  function fetchAuditLog(): void {
    const logDateFrom = (
      document.querySelector('#filter--logDateFrom') as HTMLInputElement
    ).value

    const logDateTo = (
      document.querySelector('#filter--logDateTo') as HTMLInputElement
    ).value

    const mainRecordType = (
      document.querySelector('#filter--mainRecordType') as HTMLSelectElement
    ).value

    const updateUserName = (
      document.querySelector('#filter--updateUserName') as HTMLInputElement
    ).value

    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doGetAuditLog`,
      {
        logDateFrom,
        logDateTo,
        mainRecordType,
        updateUserName,

        limit: pageLimit,
        offset: currentOffset
      },
      renderAuditLog
    )
  }

  function filterAuditLog(): void {
    currentOffset = 0
    fetchAuditLog()
  }

  function doPurge(age: string, ageLabel: string): void {
    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doPurgeAuditLog`,
      { age },
      (responseJSON: DoPurgeAuditLogResponse) => {
        if (responseJSON.success) {
          bulmaJS.alert({
            contextualColorName: 'success',
            title: i18next.t('admin:auditLogPurge'),

            message: i18next.t('admin:auditLogPurgeSuccess', {
              age: ageLabel,
              count: responseJSON.purgedCount
            })
          })

          filterAuditLog()
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: i18next.t('error'),

            message: responseJSON.message
          })
        }
      }
    )
  }

  filterFormElement.addEventListener('submit', (event) => {
    event.preventDefault()
    filterAuditLog()
  })

  filterFormElement.addEventListener('change', filterAuditLog)

  document
    .querySelector('#button--purgeAuditLog')
    ?.addEventListener('click', () => {
      let closeModalFunction: (() => void) | undefined

      function doSubmitPurge(submitEvent: Event): void {
        submitEvent.preventDefault()

        const ageSelectElement = (
          submitEvent.currentTarget as HTMLFormElement
        ).querySelector('#purge--age') as HTMLSelectElement

        const age = ageSelectElement.value
        const ageLabel =
          ageSelectElement.options[ageSelectElement.selectedIndex].textContent

        closeModalFunction?.()

        doPurge(age, ageLabel)
      }

      cityssm.openHtmlModal('adminAuditLog-purge', {
        onshow(modalElement) {
          sunrise.localize(modalElement)
        },
        onshown(modalElement, _closeModalFunction) {
          bulmaJS.toggleHtmlClipped()
          closeModalFunction = _closeModalFunction

          modalElement
            .querySelector('form')
            ?.addEventListener('submit', doSubmitPurge)
        },

        onremoved() {
          bulmaJS.toggleHtmlClipped()
        }
      })
    })

  i18next.on('initialized', fetchAuditLog)
})()

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type { i18n } from 'i18next'

import type { AuditLogEntry } from '../../database/getAuditLog.js'
import type { DoGetAuditLogResponse } from '../../handlers/admin-post/doGetAuditLog.js'
import type { DoPurgeAuditLogResponse } from '../../handlers/admin-post/doPurgeAuditLog.js'

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

  const pageLimit = 50

  let currentOffset = 0

  function getUpdateTypeIcon(updateType: string): string {
    switch (updateType) {
      case 'created': {
        return '<span class="icon has-text-success"><i class="fa-solid fa-plus"></i></span>'
      }
      case 'deleted': {
        return '<span class="icon has-text-danger"><i class="fa-solid fa-trash"></i></span>'
      }
      default: {
        return '<span class="icon has-text-warning"><i class="fa-solid fa-pen"></i></span>'
      }
    }
  }

  const maxValueLength = 100

  function truncateValue(value: string): string {
    if (value.length <= maxValueLength) {
      return value
    }
    return value.slice(0, maxValueLength) + '\u2026'
  }

  function buildValueCell(rawValue: string | null): string {
    if (rawValue === null || rawValue === 'null') {
      return `<em class="has-text-grey">null</em>`
    }
    const escaped = cityssm.escapeHTML(rawValue)
    if (rawValue.length <= maxValueLength) {
      return `<code>${escaped}</code>`
    }
    const truncated = cityssm.escapeHTML(truncateValue(rawValue))
    return `<code title="${escaped}" style="cursor:help">${truncated}</code>`
  }

  function renderAuditLog(responseJSON: DoGetAuditLogResponse): void {
    const { auditLogEntries, count, offset } = responseJSON

    if (auditLogEntries.length === 0) {
      auditLogContainerElement.innerHTML = `<p class="has-text-grey">${cityssm.escapeHTML(i18next.t('admin:auditLogNoEntries'))}</p>`
      return
    }

    const rowsHtml = auditLogEntries
      .map((entry: AuditLogEntry) => {
        const logDate = new Date(entry.logMillis)
        const dateString = logDate.toLocaleDateString()
        const timeString = logDate.toLocaleTimeString()

        return `<tr>
          <td>${getUpdateTypeIcon(entry.updateType)}</td>
          <td>${cityssm.escapeHTML(dateString)}</td>
          <td>${cityssm.escapeHTML(timeString)}</td>
          <td>${cityssm.escapeHTML(entry.mainRecordType)}</td>
          <td>${entry.mainRecordId.toString()}</td>
          <td>${cityssm.escapeHTML(entry.updateTable)}</td>
          <td>${cityssm.escapeHTML(entry.updateField)}</td>
          <td>${buildValueCell(entry.fromValue)}</td>
          <td>${buildValueCell(entry.toValue)}</td>
          <td>${cityssm.escapeHTML(entry.updateUserName)}</td>
        </tr>`
      })
      .join('')

    // eslint-disable-next-line no-unsanitized/property
    auditLogContainerElement.innerHTML = `<div class="table-container">
      <table class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th></th>
            <th>${cityssm.escapeHTML(i18next.t('common:date'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('common:time'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('admin:mainRecordType'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('admin:auditLogRecordId'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('admin:auditLogTable'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('admin:auditLogField'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('admin:auditLogFrom'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('admin:auditLogTo'))}</th>
            <th>${cityssm.escapeHTML(i18next.t('admin:userName'))}</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`

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
        currentOffset = currentOffset + pageLimit
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
              count: responseJSON.purgedCount,
              age: ageLabel
            })
          })

          filterAuditLog()
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: i18next.t('common:error'),

            message: responseJSON.message
          })
        }
      }
    )
  }

  document
    .querySelector('#button--filterAuditLog')
    ?.addEventListener('click', filterAuditLog)

  document
    .querySelector('#button--purgeAuditLog')
    ?.addEventListener('click', () => {
      const purgeAgeSelectHtml = `<div class="field">
        <label class="label">${cityssm.escapeHTML(i18next.t('admin:auditLogPurgeOlderThan'))}</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select id="purge--age">
              <option value="thirtyDays">${cityssm.escapeHTML(i18next.t('admin:auditLogPurgeThirtyDays'))}</option>
              <option value="ninetyDays">${cityssm.escapeHTML(i18next.t('admin:auditLogPurgeNinetyDays'))}</option>
              <option value="oneYear">${cityssm.escapeHTML(i18next.t('admin:auditLogPurgeOneYear'))}</option>
              <option value="all">${cityssm.escapeHTML(i18next.t('admin:auditLogPurgeEverything'))}</option>
            </select>
          </div>
        </div>
      </div>`

      bulmaJS.confirm({
        contextualColorName: 'danger',
        title: i18next.t('admin:auditLogPurge'),

        message: purgeAgeSelectHtml,
        messageIsHtml: true,

        okButton: {
          contextualColorName: 'danger',
          text: i18next.t('common:delete'),

          callbackFunction() {
            const ageSelectElement = document.querySelector(
              '#purge--age'
            ) as HTMLSelectElement | null

            const age = ageSelectElement?.value ?? 'thirtyDays'

            const ageLabel =
              ageSelectElement?.options[ageSelectElement.selectedIndex]
                .textContent ?? ''

            doPurge(age, ageLabel)
          }
        }
      })
    })
})()

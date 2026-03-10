import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'
import type { i18n } from 'i18next'

import type { DoGetRecordAuditLogResponse } from '../../handlers/common-post/doGetRecordAuditLog.js'
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

  const pageLimit = 50

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

  function renderRecordAuditLog(
    auditLogContainerElement: HTMLElement,
    auditLogUrl: string,
    currentOffset: number,
    responseJSON: DoGetRecordAuditLogResponse
  ): void {
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

        return /* html */ `
          <tr class="${getUpdateTypeColorClass(entry.updateType)}">
            <td>
              ${cityssm.escapeHTML(dateString)}<br />
              <span class="is-size-7">${cityssm.escapeHTML(timeString)}</span>
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
            <td style="max-width:200px">${buildValueCell(entry.fromValue)}</td>
            <td style="max-width:200px">${buildValueCell(entry.toValue)}</td>
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
              <th>${cityssm.escapeHTML(i18next.t('common:time'))}</th>
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
        fetchRecordAuditLog(
          auditLogContainerElement,
          auditLogUrl,
          (document.querySelector(
            '#recordAuditLog--mainRecordType'
          ) as HTMLInputElement).value,
          (document.querySelector(
            '#recordAuditLog--mainRecordId'
          ) as HTMLInputElement).value,
          Math.max(currentOffset - pageLimit, 0)
        )
      })

    auditLogContainerElement
      .querySelector("button[data-page='next']")
      ?.addEventListener('click', () => {
        fetchRecordAuditLog(
          auditLogContainerElement,
          auditLogUrl,
          (document.querySelector(
            '#recordAuditLog--mainRecordType'
          ) as HTMLInputElement).value,
          (document.querySelector(
            '#recordAuditLog--mainRecordId'
          ) as HTMLInputElement).value,
          currentOffset + pageLimit
        )
      })
  }

  function fetchRecordAuditLog(
    auditLogContainerElement: HTMLElement,
    auditLogUrl: string,
    mainRecordType: string,
    mainRecordId: string,
    offset: number
  ): void {
    cityssm.postJSON(
      auditLogUrl,
      {
        mainRecordType,
        mainRecordId,
        limit: pageLimit,
        offset
      },
      (responseJSON: DoGetRecordAuditLogResponse) => {
        renderRecordAuditLog(
          auditLogContainerElement,
          auditLogUrl,
          offset,
          responseJSON
        )
      }
    )
  }

  function openRecordAuditLogModal(options: {
    mainRecordType: string
    mainRecordId: string
    auditLogUrl: string
    recordCreateUser?: string
    recordCreateMillis?: string
    recordUpdateUser?: string
    recordUpdateMillis?: string
  }): void {
    cityssm.openHtmlModal('record-auditLog', {
      onshow(modalElement) {
        // Store record type and id for pagination
        const typeInput = document.createElement('input')
        typeInput.type = 'hidden'
        typeInput.id = 'recordAuditLog--mainRecordType'
        typeInput.value = options.mainRecordType
        modalElement.append(typeInput)

        const idInput = document.createElement('input')
        idInput.type = 'hidden'
        idInput.id = 'recordAuditLog--mainRecordId'
        idInput.value = options.mainRecordId
        modalElement.append(idInput)

        const urlInput = document.createElement('input')
        urlInput.type = 'hidden'
        urlInput.id = 'recordAuditLog--auditLogUrl'
        urlInput.value = options.auditLogUrl
        modalElement.append(urlInput)

        // Display record creation info
        const createInfoElement = modalElement.querySelector(
          '#recordAuditLog--createInfo'
        ) as HTMLElement

        if (createInfoElement !== null) {
          if (options.recordCreateUser && options.recordCreateMillis) {
            const createDate = new Date(
              Number.parseInt(options.recordCreateMillis, 10)
            )
            createInfoElement.textContent = `${options.recordCreateUser} — ${createDate.toLocaleDateString()} ${createDate.toLocaleTimeString()}`
          } else if (options.recordCreateUser) {
            createInfoElement.textContent = options.recordCreateUser
          } else {
            createInfoElement.textContent = '—'
          }
        }

        // Display record update info
        const updateInfoElement = modalElement.querySelector(
          '#recordAuditLog--updateInfo'
        ) as HTMLElement

        if (updateInfoElement !== null) {
          if (options.recordUpdateUser && options.recordUpdateMillis) {
            const updateDate = new Date(
              Number.parseInt(options.recordUpdateMillis, 10)
            )
            updateInfoElement.textContent = `${options.recordUpdateUser} — ${updateDate.toLocaleDateString()} ${updateDate.toLocaleTimeString()}`
          } else if (options.recordUpdateUser) {
            updateInfoElement.textContent = options.recordUpdateUser
          } else {
            updateInfoElement.textContent = '—'
          }
        }
      },
      onshown(modalElement, _closeModalFunction) {
        bulmaJS.toggleHtmlClipped()

        const auditLogContainerElement = modalElement.querySelector(
          '#container--recordAuditLog'
        ) as HTMLElement

        fetchRecordAuditLog(
          auditLogContainerElement,
          options.auditLogUrl,
          options.mainRecordType,
          options.mainRecordId,
          0
        )
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  // Initialize audit log buttons
  const auditLogButtons = document.querySelectorAll('.is-view-audit-log-button')

  for (const button of auditLogButtons) {
    button.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      const buttonElement = clickEvent.currentTarget as HTMLElement

      openRecordAuditLogModal({
        mainRecordType: buttonElement.dataset.mainRecordType ?? '',
        mainRecordId: buttonElement.dataset.mainRecordId ?? '',
        auditLogUrl: buttonElement.dataset.auditLogUrl ?? '',
        recordCreateUser: buttonElement.dataset.recordCreateUser,
        recordCreateMillis: buttonElement.dataset.recordCreateMillis,
        recordUpdateUser: buttonElement.dataset.recordUpdateUser,
        recordUpdateMillis: buttonElement.dataset.recordUpdateMillis
      })
    })
  }
})()

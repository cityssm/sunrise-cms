import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: Record<string, unknown>
;(() => {
  const sunrise = exports.sunrise as Sunrise

  function doBackup(): void {
    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doBackupDatabase`,
      {},
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as
          | {
              success: true
              fileName: string
            }
          | {
              success: false
              errorMessage?: string
            }

        if (responseJSON.success) {
          bulmaJS.alert({
            title: 'Database Backed Up Successfully',
            message: `Backed up to <strong>${responseJSON.fileName}</strong><br />
              To request a copy of the backup, contact your application administrator.`,
            messageIsHtml: true,
            contextualColorName: 'success'
          })
        } else {
          bulmaJS.alert({
            title: 'Error Backing Up Database',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  function doCleanup(): void {
    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doCleanupDatabase`,
      {},
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as
          | {
              success: true
              inactivatedRecordCount: number
              purgedRecordCount: number
            }
          | {
              success: false
              errorMessage?: string
            }

        if (responseJSON.success) {
          bulmaJS.alert({
            title: 'Database Cleaned Up Successfully',
            message: `${responseJSON.inactivatedRecordCount} records inactivated,
              ${responseJSON.purgedRecordCount} permanently deleted.`,
            contextualColorName: 'success'
          })
        } else {
          bulmaJS.alert({
            title: 'Error Cleaning Database',
            message: responseJSON.errorMessage ?? '',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  document
    .querySelector('#button--cleanupDatabase')
    ?.addEventListener('click', () => {
      bulmaJS.confirm({
        title: 'Cleanup Database',
        message: 'Are you sure you want to cleanup up the database?',
        okButton: {
          text: 'Yes, Cleanup Database',
          callbackFunction: doCleanup
        }
      })
    })

  document
    .querySelector('#button--backupDatabase')
    ?.addEventListener('click', () => {
      bulmaJS.confirm({
        title: 'Backup Database',
        message: 'Are you sure you want to backup up the database?',
        okButton: {
          text: 'Yes, Backup Database',
          callbackFunction: doBackup
        }
      })
    })
})()

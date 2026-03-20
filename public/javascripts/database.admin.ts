import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/types.js'

import type { DoBackupDatabaseResponse } from '../../handlers/admin-post/doBackupDatabase.js'
import type { DoCleanupDatabaseResponse } from '../../handlers/admin-post/doCleanupDatabase.js'

import type { Sunrise } from './types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

declare const exports: {
  sunrise: Sunrise
}
;(() => {
  const sunrise = exports.sunrise

  function doBackup(): void {
    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doBackupDatabase`,
      {},
      (responseJSON: DoBackupDatabaseResponse) => {
        if (responseJSON.success) {
          bulmaJS.alert({
            contextualColorName: 'success',
            title: 'Database Backed Up Successfully',

            message: `Backed up to <strong>${responseJSON.fileName}</strong><br />
              To request a copy of the backup, contact your application administrator.`,
            messageIsHtml: true
          })
          ;(
            document.querySelector('#database--lastBackup') as HTMLElement
          ).textContent = 'Right now'
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Backing Up Database',

            message: responseJSON.errorMessage
          })
        }
      }
    )
  }

  function doCleanup(): void {
    cityssm.postJSON(
      `${sunrise.urlPrefix}/admin/doCleanupDatabase`,
      {},
      (responseJSON: DoCleanupDatabaseResponse) => {
        bulmaJS.alert({
          contextualColorName: 'success',
          title: 'Database Cleaned Up Successfully',

          message: `${responseJSON.inactivatedRecordCount} records inactivated,
              ${responseJSON.purgedRecordCount} permanently deleted.`
        })
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
          callbackFunction: doCleanup,
          text: 'Yes, Cleanup Database'
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
          callbackFunction: doBackup,
          text: 'Yes, Backup Database'
        }
      })
    })
})()

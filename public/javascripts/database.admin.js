"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    function doBackup() {
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doBackupDatabase`, {}, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                bulmaJS.alert({
                    contextualColorName: 'success',
                    title: 'Database Backed Up Successfully',
                    message: `Backed up to <strong>${responseJSON.fileName}</strong><br />
              To request a copy of the backup, contact your application administrator.`,
                    messageIsHtml: true
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Backing Up Database',
                    message: responseJSON.errorMessage ?? ''
                });
            }
        });
    }
    function doCleanup() {
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doCleanupDatabase`, {}, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                bulmaJS.alert({
                    contextualColorName: 'success',
                    title: 'Database Cleaned Up Successfully',
                    message: `${responseJSON.inactivatedRecordCount} records inactivated,
              ${responseJSON.purgedRecordCount} permanently deleted.`
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Cleaning Database',
                    message: responseJSON.errorMessage ?? ''
                });
            }
        });
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
        });
    });
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
        });
    });
})();

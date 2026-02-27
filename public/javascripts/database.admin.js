(() => {
    const sunrise = exports.sunrise;
    function doBackup() {
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doBackupDatabase`, {}, (responseJSON) => {
            if (responseJSON.success) {
                bulmaJS.alert({
                    contextualColorName: 'success',
                    title: 'Database Backed Up Successfully',
                    message: `Backed up to <strong>${responseJSON.fileName}</strong><br />
              To request a copy of the backup, contact your application administrator.`,
                    messageIsHtml: true
                });
                document.querySelector('#database--lastBackup').textContent = 'Right now';
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
        cityssm.postJSON(`${sunrise.urlPrefix}/admin/doCleanupDatabase`, {}, (responseJSON) => {
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

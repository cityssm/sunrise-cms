(() => {
    const sunrise = exports.sunrise;
    document
        .querySelector('button.is-restore-funeral-home-button')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        const funeralHomeId = buttonElement.dataset.funeralHomeId ?? '';
        if (funeralHomeId === '') {
            return;
        }
        function doRestore() {
            cityssm.postJSON(`${sunrise.urlPrefix}/funeralHomes/doRestoreFuneralHome`, { funeralHomeId }, (responseJSON) => {
                if (responseJSON.success) {
                    globalThis.location.reload();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Restoring Funeral Home',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Restore Funeral Home',
            message: 'Are you sure you want to restore this funeral home? It will be visible again.',
            okButton: {
                callbackFunction: doRestore,
                text: 'Yes, Restore Funeral Home'
            }
        });
    });
})();

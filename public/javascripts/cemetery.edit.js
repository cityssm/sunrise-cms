"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const cemeteryId = document.querySelector('#cemetery--cemeteryId').value;
    const isCreate = cemeteryId === '';
    /*
     * Cemetery Map
     */
    document
        .querySelector('#button--selectCoordinate')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        sunrise.openLeafletCoordinateSelectorModal({
            latitudeElement: document.querySelector('#cemetery--cemeteryLatitude'),
            longitudeElement: document.querySelector('#cemetery--cemeteryLongitude'),
            callbackFunction: () => {
                sunrise.setUnsavedChanges();
            }
        });
    });
    /*
     * Cemetery Form
     */
    const cemeteryForm = document.querySelector('#form--cemetery');
    function setUnsavedChanges() {
        sunrise.setUnsavedChanges();
        document
            .querySelector("button[type='submit'][form='form--cemetery']")
            ?.classList.remove('is-light');
    }
    function clearUnsavedChanges() {
        sunrise.clearUnsavedChanges();
        document
            .querySelector("button[type='submit'][form='form--cemetery']")
            ?.classList.add('is-light');
    }
    function updateCemetery(formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON(`${sunrise.urlPrefix}/cemeteries/${isCreate ? 'doCreateCemetery' : 'doUpdateCemetery'}`, cemeteryForm, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                clearUnsavedChanges();
                if (isCreate) {
                    globalThis.location.href = sunrise.getCemeteryURL(responseJSON.cemeteryId, true);
                }
                else {
                    if (responseJSON.doRebuildBurialSiteNames ?? false) {
                        bulmaJS.alert({
                            message: `<strong>Cemetery Updated Successfully</strong><br />
                  Note that rebuilding burial site names may take a few minutes.`,
                            messageIsHtml: true,
                            contextualColorName: 'warning'
                        });
                    }
                    else {
                        bulmaJS.alert({
                            message: 'Cemetery Updated Successfully',
                            contextualColorName: 'success'
                        });
                    }
                }
            }
            else {
                bulmaJS.alert({
                    title: 'Error Updating Cemetery',
                    message: responseJSON.errorMessage ?? '',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    cemeteryForm.addEventListener('submit', updateCemetery);
    const inputElements = cemeteryForm.querySelectorAll('input, select');
    for (const inputElement of inputElements) {
        inputElement.addEventListener('change', setUnsavedChanges);
    }
    document
        .querySelector('#button--deleteCemetery')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/cemeteries/doDeleteCemetery`, {
                cemeteryId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    globalThis.location.href = sunrise.getCemeteryURL();
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Deleting Cemetery',
                        message: responseJSON.errorMessage ?? '',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: 'Delete Cemetery',
            message: 'Are you sure you want to delete this cemetery and all related burial sites?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete Cemetery',
                callbackFunction: doDelete
            }
        });
    });
})();

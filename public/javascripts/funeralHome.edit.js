"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sunrise = exports.sunrise;
    const funeralHomeId = document.querySelector('#funeralHome--funeralHomeId').value;
    const isCreate = funeralHomeId === '';
    const funeralHomeForm = document.querySelector('#form--funeralHome');
    function setUnsavedChanges() {
        sunrise.setUnsavedChanges();
        document
            .querySelector("button[type='submit'][form='form--funeralHome']")
            ?.classList.remove('is-light');
    }
    function clearUnsavedChanges() {
        sunrise.clearUnsavedChanges();
        document
            .querySelector("button[type='submit'][form='form--funeralHome']")
            ?.classList.add('is-light');
    }
    function updateFuneralHome(formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON(`${sunrise.urlPrefix}/funeralHomes/${isCreate ? 'doCreateFuneralHome' : 'doUpdateFuneralHome'}`, funeralHomeForm, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                clearUnsavedChanges();
                if (isCreate) {
                    globalThis.location.href = sunrise.getFuneralHomeUrl(responseJSON.funeralHomeId, true);
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Funeral Home Updated Successfully'
                    });
                }
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Updating Funeral Home',
                    message: responseJSON.errorMessage ?? ''
                });
            }
        });
    }
    funeralHomeForm.addEventListener('submit', updateFuneralHome);
    const inputElements = funeralHomeForm.querySelectorAll('input, select');
    for (const inputElement of inputElements) {
        inputElement.addEventListener('change', setUnsavedChanges);
    }
    document
        .querySelector('#button--deleteFuneralHome')
        ?.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/funeralHomes/doDeleteFuneralHome`, {
                funeralHomeId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    globalThis.location.href = sunrise.getFuneralHomeUrl();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Deleting Funeral Home',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Funeral Home',
            message: 'Are you sure you want to delete this funeral home?',
            okButton: {
                callbackFunction: doDelete,
                text: 'Yes, Delete Funeral Home'
            }
        });
    });
})();

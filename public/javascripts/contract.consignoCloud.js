"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const sendToConsignoCloudButtonElement = document.querySelector('#button--sendToConsignoCloud');
    if (sendToConsignoCloudButtonElement === null) {
        return;
    }
    const sunrise = exports.sunrise;
    const contractId = document.querySelector('#contract--contractId').value;
    let modalElement;
    let closeModalFunction;
    function loadConsignoCloudModal() {
        if (modalElement === undefined) {
            return;
        }
        cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doGetContractDetailsForConsignoCloud`, { contractId }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (!responseJSON.success) {
                bulmaJS.alert({
                    contextualColorName: 'warning',
                    title: 'ConsignO Cloud Error',
                    message: responseJSON.errorMessage
                });
                closeModalFunction?.();
                return;
            }
            /*
             * Populate workflow settings
             */
            ;
            (modalElement?.querySelector('#consignoCloudStart--contractId')).value = contractId;
            (modalElement?.querySelector('#consignoCloudStart--workflowTitle')).value = responseJSON.workflowTitle;
            const oneWeekFromNow = new Date();
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
            (modalElement?.querySelector(
            // eslint-disable-next-line no-secrets/no-secrets
            '#consignoCloudStart--workflowExpiresOn')).valueAsDate = oneWeekFromNow;
            /*
             * Populate print options
             */
            const printsContainerElement = modalElement?.querySelector('#consignoCloudStart--printsContainer');
            for (const print of responseJSON.consignoCloudPrints) {
                const printElement = document.createElement('label');
                printElement.className = 'panel-block';
                printElement.innerHTML = `<input type="checkbox"
            name="printNames"
            value="${cityssm.escapeHTML(print.printName)}" checked />
              ${cityssm.escapeHTML(print.printTitle)}`;
                printsContainerElement.append(printElement);
            }
            /*
             * Populate the signer information
             */
            ;
            (modalElement?.querySelector('#consignoCloudStart--signerFirstName')).value = responseJSON.signerFirstName;
            (modalElement?.querySelector('#consignoCloudStart--signerLastName')).value = responseJSON.signerLastName;
            (modalElement?.querySelector('#consignoCloudStart--signerEmail')).value = responseJSON.signerEmail;
            (modalElement?.querySelector('#consignoCloudStart--signerPhone')).value = responseJSON.signerPhone;
            /*
             * Toggle the visibility of the form
             */
            modalElement
                ?.querySelector('#consignoCloudTab--loading')
                ?.classList.add('is-hidden');
            modalElement
                ?.querySelector('#consignoCloudTab--form')
                ?.classList.remove('is-hidden');
            modalElement
                ?.querySelector('button[type="submit"]')
                ?.classList.remove('is-hidden');
        });
    }
    function disableSubmitButton() {
        if (modalElement === undefined) {
            return;
        }
        const submitButtonElement = modalElement.querySelector('button[type="submit"]');
        submitButtonElement.disabled = true;
        submitButtonElement.classList.add('is-loading');
    }
    function enableSubmitButton() {
        if (modalElement === undefined) {
            return;
        }
        const submitButtonElement = modalElement.querySelector('button[type="submit"]');
        submitButtonElement.disabled = false;
        submitButtonElement.classList.remove('is-loading');
    }
    function submitConsignoCloudForm(event) {
        event.preventDefault();
        const formElement = event.currentTarget;
        /*
         * Disable the submit button
         */
        disableSubmitButton();
        /*
         * Validate the form
         */
        const printNameCheckboxElements = formElement.querySelectorAll('input[name="printNames"][type="checkbox"]');
        let hasSelectedPrints = false;
        for (const printNameCheckboxElement of printNameCheckboxElements) {
            if (printNameCheckboxElement.checked) {
                hasSelectedPrints = true;
                break;
            }
        }
        if (!hasSelectedPrints) {
            bulmaJS.alert({
                contextualColorName: 'warning',
                title: 'No Documents Selected',
                message: 'Please select at least one document to include in the workflow.'
            });
            enableSubmitButton();
            return;
        }
        /*
         * Submit the form
         */
        cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doStartConsignoCloudWorkflow`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                closeModalFunction?.();
                bulmaJS.alert({
                    contextualColorName: 'success',
                    title: 'ConsignO Cloud Workflow Created Successfully',
                    message: `The workflow is not yet running.
              Continue in ConsignO Cloud to start the workflow.`,
                    okButton: {
                        text: 'Open Workflow in ConsignO Cloud',
                        callbackFunction() {
                            window.open(responseJSON.workflowEditUrl, '_blank');
                        }
                    }
                });
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'ConsignO Cloud Error',
                    message: responseJSON.errorMessage
                });
                enableSubmitButton();
            }
        });
    }
    function swapSignerNames(event) {
        event.preventDefault();
        if (modalElement === undefined) {
            return;
        }
        const firstNameInputElement = modalElement.querySelector('#consignoCloudStart--signerFirstName');
        const lastNameInputElement = modalElement.querySelector('#consignoCloudStart--signerLastName');
        const tempFirstName = firstNameInputElement.value;
        firstNameInputElement.value = lastNameInputElement.value;
        lastNameInputElement.value = tempFirstName;
    }
    sendToConsignoCloudButtonElement.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        if (sunrise.hasUnsavedChanges()) {
            bulmaJS.alert({
                contextualColorName: 'warning',
                title: 'Unsaved Changes',
                message: 'Please save your changes before sending to ConsignO Cloud for signatures.'
            });
            return;
        }
        cityssm.openHtmlModal('contract-sendToConsignoCloud', {
            onshown(_modalElement, _closeModalFunction) {
                modalElement = _modalElement;
                closeModalFunction = _closeModalFunction;
                bulmaJS.toggleHtmlClipped();
                loadConsignoCloudModal();
                modalElement
                    .querySelector('#consignoCloudStart--swapNames')
                    ?.addEventListener('click', swapSignerNames);
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', submitConsignoCloudForm);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    });
})();

// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
(() => {
    const sunrise = exports.sunrise;
    const contractId = document.querySelector('#contract--contractId').value;
    let contractFees = exports.contractFees;
    const contractFeesContainerElement = document.querySelector('#container--contractFees');
    function getFeeGrandTotal() {
        let feeGrandTotal = 0;
        for (const contractFee of contractFees) {
            feeGrandTotal +=
                ((contractFee.feeAmount ?? 0) + (contractFee.taxAmount ?? 0)) *
                    (contractFee.quantity ?? 0);
        }
        return feeGrandTotal;
    }
    function editContractFeeQuantity(clickEvent) {
        const feeId = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
            .feeId ?? '', 10);
        const fee = contractFees.find((possibleFee) => possibleFee.feeId === feeId);
        let updateCloseModalFunction;
        function doUpdateQuantity(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doUpdateContractFeeQuantity`, formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    contractFees = responseJSON.contractFees;
                    renderContractFees();
                    updateCloseModalFunction();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Quantity',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('contract-editFeeQuantity', {
            onshow(modalElement) {
                ;
                modalElement.querySelector('#contractFeeQuantity--contractId').value = contractId;
                modalElement.querySelector('#contractFeeQuantity--feeId').value = fee.feeId.toString();
                modalElement.querySelector('#contractFeeQuantity--quantity').valueAsNumber = fee.quantity ?? 0;
                modalElement.querySelector('#contractFeeQuantity--quantityUnit').textContent = fee.quantityUnit ?? '';
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                updateCloseModalFunction = closeModalFunction;
                modalElement.querySelector('#contractFeeQuantity--quantity').focus();
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doUpdateQuantity);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteContractFee(clickEvent) {
        const feeId = clickEvent.currentTarget.closest('.container--contractFee').dataset.feeId;
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doDeleteContractFee`, {
                contractId,
                feeId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    contractFees = responseJSON.contractFees;
                    renderContractFees();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Deleting Fee',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Fee',
            message: 'Are you sure you want to delete this fee?',
            okButton: {
                callbackFunction: doDelete,
                text: 'Yes, Delete Fee'
            }
        });
    }
    // eslint-disable-next-line complexity
    function renderContractFees() {
        if (contractFees.length === 0) {
            contractFeesContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no fees associated with this contract.</p>
        </div>`;
            renderContractTransactions();
            return;
        }
        contractFeesContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
      <thead><tr>
        <th>Fee</th>
        <th><span class="is-sr-only">Unit Cost</span></th>
        <th class="has-width-1"><span class="is-sr-only">&times;</span></th>
        <th class="has-width-1"><span class="is-sr-only">Quantity</span></th>
        <th class="has-width-1"><span class="is-sr-only">equals</span></th>
        <th class="has-width-1 has-text-right">Total</th>
        <th class="has-width-1 is-hidden-print"><span class="is-sr-only">Options</span></th>
      </tr></thead>
      <tbody></tbody>
      <tfoot><tr>
        <th colspan="5">Subtotal</th>
        <td class="has-text-weight-bold has-text-right" id="contractFees--feeAmountTotal"></td>
        <td class="is-hidden-print"></td>
      </tr><tr>
        <th colspan="5">Tax</th>
        <td class="has-text-right" id="contractFees--taxAmountTotal"></td>
        <td class="is-hidden-print"></td>
      </tr><tr>
        <th colspan="5">Grand Total</th>
        <td class="has-text-weight-bold has-text-right" id="contractFees--grandTotal"></td>
        <td class="is-hidden-print"></td>
      </tr></tfoot></table>`;
        let feeAmountTotal = 0;
        let taxAmountTotal = 0;
        for (const contractFee of contractFees) {
            const tableRowElement = document.createElement('tr');
            tableRowElement.className = 'container--contractFee';
            tableRowElement.dataset.feeId = contractFee.feeId.toString();
            tableRowElement.dataset.includeQuantity =
                contractFee.includeQuantity ?? false ? '1' : '0';
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = `<td colspan="${contractFee.quantity === 1 ? '5' : '1'}">
          ${cityssm.escapeHTML(contractFee.feeName ?? '')}<br />
          <span class="tag">${cityssm.escapeHTML(contractFee.feeCategory ?? '')}</span>
          </td>
          ${contractFee.quantity === 1
                ? ''
                : `<td class="has-text-right">
                  $${contractFee.feeAmount?.toFixed(2)}
                  </td>
                  <td>&times;</td>
                  <td class="has-text-right">${contractFee.quantity?.toString()}</td>
                  <td>=</td>`}
          <td class="has-text-right">
            $${((contractFee.feeAmount ?? 0) * (contractFee.quantity ?? 0)).toFixed(2)}
          </td>
          <td class="is-hidden-print">
          <div class="buttons are-small is-flex-wrap-nowrap is-justify-content-end">
          ${contractFee.includeQuantity ?? false
                ? `<button class="button is-primary button--editQuantity">
                  <span class="icon is-small"><i class="fa-solid fa-pencil-alt"></i></span>
                  <span>Edit</span>
                  </button>`
                : ''}
          <button class="button is-danger is-light button--delete" title="Delete Fee" type="button">
            <span class="icon is-small"><i class="fa-solid fa-trash"></i></span>
          </button>
          </div>
          </td>`;
            tableRowElement
                .querySelector('.button--editQuantity')
                ?.addEventListener('click', editContractFeeQuantity);
            tableRowElement
                .querySelector('.button--delete')
                ?.addEventListener('click', deleteContractFee);
            contractFeesContainerElement
                .querySelector('tbody')
                ?.append(tableRowElement);
            feeAmountTotal +=
                (contractFee.feeAmount ?? 0) * (contractFee.quantity ?? 0);
            taxAmountTotal +=
                (contractFee.taxAmount ?? 0) * (contractFee.quantity ?? 0);
        }
        ;
        contractFeesContainerElement.querySelector('#contractFees--feeAmountTotal').textContent = `$${feeAmountTotal.toFixed(2)}`;
        contractFeesContainerElement.querySelector('#contractFees--taxAmountTotal').textContent = `$${taxAmountTotal.toFixed(2)}`;
        contractFeesContainerElement.querySelector('#contractFees--grandTotal').textContent = `$${(feeAmountTotal + taxAmountTotal).toFixed(2)}`;
        renderContractTransactions();
    }
    const addFeeButtonElement = document.querySelector('#button--addFee');
    addFeeButtonElement.addEventListener('click', () => {
        if (sunrise.hasUnsavedChanges()) {
            bulmaJS.alert({
                contextualColorName: 'warning',
                message: 'Please save all unsaved changes before adding fees.'
            });
            return;
        }
        let feeCategories;
        let feeFilterElement;
        let feeFilterResultsElement;
        function doAddFeeCategory(clickEvent) {
            clickEvent.preventDefault();
            const feeCategoryId = Number.parseInt(clickEvent.currentTarget.dataset.feeCategoryId ?? '', 10);
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doAddContractFeeCategory`, {
                contractId,
                feeCategoryId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    contractFees = responseJSON.contractFees;
                    renderContractFees();
                    bulmaJS.alert({
                        contextualColorName: 'success',
                        message: 'Fee Group Added Successfully'
                    });
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Fee',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        function doAddFee(feeId, quantity = 1) {
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doAddContractFee`, {
                contractId,
                feeId,
                quantity
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    contractFees = responseJSON.contractFees;
                    renderContractFees();
                    filterFees();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Adding Fee',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        function doSetQuantityAndAddFee(fee) {
            let quantityElement;
            let quantityCloseModalFunction;
            function doSetQuantity(submitEvent) {
                submitEvent.preventDefault();
                doAddFee(fee.feeId, quantityElement.value);
                quantityCloseModalFunction();
            }
            cityssm.openHtmlModal('contract-setFeeQuantity', {
                onshow(modalElement) {
                    ;
                    modalElement.querySelector('#contractFeeQuantity--quantityUnit').textContent = fee.quantityUnit ?? '';
                },
                onshown(modalElement, closeModalFunction) {
                    quantityCloseModalFunction = closeModalFunction;
                    quantityElement = modalElement.querySelector('#contractFeeQuantity--quantity');
                    modalElement
                        .querySelector('form')
                        ?.addEventListener('submit', doSetQuantity);
                }
            });
        }
        function tryAddFee(clickEvent) {
            clickEvent.preventDefault();
            const feeId = Number.parseInt(clickEvent.currentTarget.dataset.feeId ?? '', 10);
            const feeCategoryId = Number.parseInt(clickEvent.currentTarget.dataset.feeCategoryId ?? '', 10);
            const feeCategory = feeCategories.find((currentFeeCategory) => currentFeeCategory.feeCategoryId === feeCategoryId);
            const fee = feeCategory.fees.find((currentFee) => currentFee.feeId === feeId);
            if (fee.includeQuantity ?? false) {
                doSetQuantityAndAddFee(fee);
            }
            else {
                doAddFee(feeId);
            }
        }
        function filterFees() {
            const filterStringPieces = feeFilterElement.value
                .trim()
                .toLowerCase()
                .split(' ');
            feeFilterResultsElement.innerHTML = '';
            for (const feeCategory of feeCategories) {
                const categoryContainerElement = document.createElement('div');
                categoryContainerElement.className = 'container--feeCategory';
                categoryContainerElement.dataset.feeCategoryId =
                    feeCategory.feeCategoryId.toString();
                categoryContainerElement.innerHTML = `<div class="columns is-vcentered">
          <div class="column">
            <h4 class="title is-5">
            ${cityssm.escapeHTML(feeCategory.feeCategory)}
            </h4>
          </div>
          </div>
          <div class="panel mb-5"></div>`;
                if (feeCategory.isGroupedFee) {
                    categoryContainerElement
                        .querySelector('.columns')
                        ?.insertAdjacentHTML('beforeend', `<div class="column is-narrow has-text-right">
                  <button class="button is-small is-success" type="button" data-fee-category-id="${cityssm.escapeHTML(feeCategory.feeCategoryId.toString())}">
                    <span class="icon is-small"><i class="fa-solid fa-plus"></i></span>
                    <span>Add Fee Group</span>
                  </button>
                </div>`);
                    categoryContainerElement
                        .querySelector('button')
                        ?.addEventListener('click', doAddFeeCategory);
                }
                let hasFees = false;
                for (const fee of feeCategory.fees) {
                    // Don't include already applied fees that limit quantity
                    if (contractFeesContainerElement.querySelector(`.container--contractFee[data-fee-id='${fee.feeId}'][data-include-quantity='0']`) !== null) {
                        continue;
                    }
                    let includeFee = true;
                    const feeSearchString = `${feeCategory.feeCategory} ${fee.feeName ?? ''} ${fee.feeDescription ?? ''}`.toLowerCase();
                    for (const filterStringPiece of filterStringPieces) {
                        if (!feeSearchString.includes(filterStringPiece)) {
                            includeFee = false;
                            break;
                        }
                    }
                    if (!includeFee) {
                        continue;
                    }
                    hasFees = true;
                    const panelBlockElement = document.createElement(feeCategory.isGroupedFee ? 'div' : 'a');
                    panelBlockElement.className = 'panel-block is-block container--fee';
                    panelBlockElement.dataset.feeId = fee.feeId.toString();
                    panelBlockElement.dataset.feeCategoryId =
                        feeCategory.feeCategoryId.toString();
                    // eslint-disable-next-line no-unsanitized/property
                    panelBlockElement.innerHTML = `<strong>${cityssm.escapeHTML(fee.feeName ?? '')}</strong><br />
              <small>
              ${cityssm
                        .escapeHTML(fee.feeDescription ?? '')
                        .replaceAll('\n', '<br />')}
              </small>`;
                    if (!feeCategory.isGroupedFee) {
                        ;
                        panelBlockElement.href = '#';
                        panelBlockElement.addEventListener('click', tryAddFee);
                    }
                    ;
                    categoryContainerElement.querySelector('.panel').append(panelBlockElement);
                }
                if (hasFees) {
                    feeFilterResultsElement.append(categoryContainerElement);
                }
            }
        }
        cityssm.openHtmlModal('contract-addFee', {
            onshow(modalElement) {
                feeFilterElement = modalElement.querySelector('#feeSelect--feeName');
                feeFilterResultsElement = modalElement.querySelector('#resultsContainer--feeSelect');
                cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doGetFees`, {
                    contractId
                }, (rawResponseJSON) => {
                    const responseJSON = rawResponseJSON;
                    feeCategories = responseJSON.feeCategories;
                    feeFilterElement.disabled = false;
                    feeFilterElement.addEventListener('keyup', filterFees);
                    feeFilterElement.focus();
                    filterFees();
                });
            },
            onshown() {
                bulmaJS.toggleHtmlClipped();
            },
            onhidden() {
                renderContractFees();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
                addFeeButtonElement.focus();
            }
        });
    });
    let contractTransactions = exports.contractTransactions;
    const contractTransactionsContainerElement = document.querySelector('#container--contractTransactions');
    function getTransactionGrandTotal() {
        let transactionGrandTotal = 0;
        for (const contractTransaction of contractTransactions) {
            transactionGrandTotal += contractTransaction.transactionAmount;
        }
        return transactionGrandTotal;
    }
    function editContractTransaction(clickEvent) {
        const transactionIndex = Number.parseInt(clickEvent.currentTarget.closest('tr')?.dataset
            .transactionIndex ?? '', 10);
        const transaction = contractTransactions.find((possibleTransaction) => possibleTransaction.transactionIndex === transactionIndex);
        let editCloseModalFunction;
        function doEdit(formEvent) {
            formEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doUpdateContractTransaction`, formEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    contractTransactions = responseJSON.contractTransactions;
                    renderContractTransactions();
                    editCloseModalFunction();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Updating Transaction',
                        message: 'Please try again.'
                    });
                }
            });
        }
        cityssm.openHtmlModal('contract-editTransaction', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                modalElement.querySelector('#contractTransactionEdit--contractId').value = contractId;
                modalElement.querySelector('#contractTransactionEdit--transactionIndex').value = transaction.transactionIndex?.toString() ?? '';
                modalElement.querySelector('#contractTransactionEdit--transactionAmount').value = transaction.transactionAmount.toFixed(2);
                if ((transaction.isInvoiced ?? 0) !== 0) {
                    ;
                    modalElement.querySelector('#contractTransactionEdit--isInvoiced').value = '1';
                }
                ;
                modalElement.querySelector('#contractTransactionEdit--externalReceiptNumber').value = transaction.externalReceiptNumber ?? '';
                modalElement.querySelector('#contractTransactionEdit--transactionNote').value = transaction.transactionNote ?? '';
                modalElement.querySelector('#contractTransactionEdit--transactionDateString').value = transaction.transactionDateString ?? '';
                modalElement.querySelector('#contractTransactionEdit--transactionTimeString').value = transaction.transactionTimeString ?? '';
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                modalElement.querySelector('#contractTransactionEdit--transactionAmount').focus();
                modalElement.querySelector('form')?.addEventListener('submit', doEdit);
                editCloseModalFunction = closeModalFunction;
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function deleteContractTransaction(clickEvent) {
        const transactionIndex = clickEvent.currentTarget.closest('.container--contractTransaction').dataset.transactionIndex;
        function doDelete() {
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doDeleteContractTransaction`, {
                contractId,
                transactionIndex
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    contractTransactions = responseJSON.contractTransactions;
                    renderContractTransactions();
                }
                else {
                    bulmaJS.alert({
                        contextualColorName: 'danger',
                        title: 'Error Deleting Transaction',
                        message: responseJSON.errorMessage ?? ''
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Transaction',
            message: 'Are you sure you want to delete this transaction?',
            okButton: {
                callbackFunction: doDelete,
                text: 'Yes, Delete Transaction'
            }
        });
    }
    function renderContractTransactions() {
        if (contractTransactions.length === 0) {
            // eslint-disable-next-line no-unsanitized/property
            contractTransactionsContainerElement.innerHTML = `<div class="message ${contractFees.length === 0 ? 'is-info' : 'is-warning'}">
          <p class="message-body">There are no transactions associated with this contract.</p>
          </div>`;
            return;
        }
        contractTransactionsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
        <thead><tr>
          <th class="has-width-1">Date</th>
          <th>${cityssm.escapeHTML(sunrise.escapedAliases.ExternalReceiptNumber)}</th>
          <th class="has-text-right has-width-1">Amount</th>
          <th class="has-width-1 is-hidden-print"><span class="is-sr-only">Options</span></th>
        </tr></thead>
        <tbody></tbody>
        <tfoot><tr>
          <th colspan="2">Transaction Total</th>
          <td class="has-text-weight-bold has-text-right" id="contractTransactions--grandTotal"></td>
          <td class="is-hidden-print"></td>
        </tr></tfoot>
        </table>`;
        let transactionGrandTotal = 0;
        for (const contractTransaction of contractTransactions) {
            transactionGrandTotal += contractTransaction.transactionAmount;
            const tableRowElement = document.createElement('tr');
            tableRowElement.className = 'container--contractTransaction';
            tableRowElement.dataset.transactionIndex =
                contractTransaction.transactionIndex?.toString();
            let externalReceiptNumberHTML = '';
            if (contractTransaction.externalReceiptNumber !== '') {
                externalReceiptNumberHTML = cityssm.escapeHTML(contractTransaction.externalReceiptNumber ?? '');
                if (sunrise.dynamicsGPIntegrationIsEnabled) {
                    if (contractTransaction.dynamicsGPDocument === undefined) {
                        externalReceiptNumberHTML += ` <span title="No Matching Document Found">
                <i class="fa-solid fa-times-circle has-text-danger"></i>
              </span>`;
                    }
                    else if (contractTransaction.dynamicsGPDocument.documentTotal.toFixed(2) ===
                        contractTransaction.transactionAmount.toFixed(2)) {
                        externalReceiptNumberHTML += ` <span title="Matching Document Found">
                <i class="fa-solid fa-check-circle has-text-success"></i>
              </span>`;
                    }
                    else {
                        externalReceiptNumberHTML += ` <span title="Matching Document: $${contractTransaction.dynamicsGPDocument.documentTotal.toFixed(2)}">
            <i class="fa-solid fa-check-circle has-text-warning"></i>
            </span>`;
                    }
                }
                externalReceiptNumberHTML += '<br />';
            }
            // eslint-disable-next-line no-unsanitized/property
            tableRowElement.innerHTML = `<td>
        ${cityssm.escapeHTML(contractTransaction.transactionDateString ?? '')}
        ${(contractTransaction.isInvoiced ?? 0) === 0
                ? ''
                : '<br /><span class="tag is-info">Invoiced</span>'}
        </td>
        <td>
          ${externalReceiptNumberHTML}
          <small>${cityssm.escapeHTML(contractTransaction.transactionNote ?? '')}</small>
        </td>
        <td class="has-text-right">
          $${cityssm.escapeHTML(contractTransaction.transactionAmount.toFixed(2))}
        </td>
        <td class="is-hidden-print">
          <div class="buttons are-small is-flex-wrap-nowrap is-justify-content-end">
            <button class="button is-primary button--edit" title="Edit Transaction" type="button">
              <span class="icon"><i class="fa-solid fa-pencil-alt"></i></span>
            </button>
            <button class="button is-danger is-light button--delete" title="Delete Transaction" type="button">
              <span class="icon is-small"><i class="fa-solid fa-trash"></i></span>
            </button>
          </div>
        </td>`;
            tableRowElement
                .querySelector('.button--edit')
                ?.addEventListener('click', editContractTransaction);
            tableRowElement
                .querySelector('.button--delete')
                ?.addEventListener('click', deleteContractTransaction);
            contractTransactionsContainerElement
                .querySelector('tbody')
                ?.append(tableRowElement);
        }
        ;
        contractTransactionsContainerElement.querySelector('#contractTransactions--grandTotal').textContent = `$${transactionGrandTotal.toFixed(2)}`;
        const feeGrandTotal = getFeeGrandTotal();
        if (feeGrandTotal.toFixed(2) !== transactionGrandTotal.toFixed(2)) {
            const difference = feeGrandTotal - transactionGrandTotal;
            const differenceClassName = difference < 0 ? 'is-danger' : 'is-warning';
            // eslint-disable-next-line no-unsanitized/method
            contractTransactionsContainerElement.insertAdjacentHTML('afterbegin', `<div class="message ${differenceClassName}">
          <div class="message-body">
            <div class="level">
              <div class="level-left">
                <div class="level-item">
                  ${difference < 0 ? 'Overpayment' : 'Outstanding Balance'}
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  $${cityssm.escapeHTML(Math.abs(difference).toFixed(2))}
                </div>
              </div>
            </div>
          </div></div>`);
        }
    }
    const addTransactionButtonElement = document.querySelector('#button--addTransaction');
    addTransactionButtonElement.addEventListener('click', () => {
        let transactionAmountElement;
        let externalReceiptNumberElement;
        let addCloseModalFunction;
        function doAddTransaction(submitEvent) {
            submitEvent.preventDefault();
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doAddContractTransaction`, submitEvent.currentTarget, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    contractTransactions = responseJSON.contractTransactions;
                    addCloseModalFunction();
                    renderContractTransactions();
                }
                else {
                    bulmaJS.confirm({
                        contextualColorName: 'danger',
                        message: responseJSON.errorMessage ?? '',
                        title: 'Error Adding Transaction'
                    });
                }
            });
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        function dynamicsGP_refreshExternalReceiptNumberIcon() {
            const externalReceiptNumber = externalReceiptNumberElement.value;
            const iconElement = externalReceiptNumberElement
                .closest('.control')
                ?.querySelector('.icon');
            const helpTextElement = externalReceiptNumberElement
                .closest('.field')
                ?.querySelector('.help');
            if (externalReceiptNumber === '') {
                helpTextElement.innerHTML = '&nbsp;';
                iconElement.innerHTML = '<i class="fa-solid fa-minus"></i>';
                return;
            }
            cityssm.postJSON(`${sunrise.urlPrefix}/contracts/doGetDynamicsGPDocument`, {
                externalReceiptNumber
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (!responseJSON.success ||
                    responseJSON.dynamicsGPDocument === undefined) {
                    helpTextElement.textContent = 'No Matching Document Found';
                    iconElement.innerHTML = '<i class="fa-solid fa-times-circle"></i>';
                }
                else if (transactionAmountElement.valueAsNumber ===
                    responseJSON.dynamicsGPDocument.documentTotal) {
                    helpTextElement.textContent = 'Matching Document Found';
                    iconElement.innerHTML = '<i class="fa-solid fa-check-circle"></i>';
                }
                else {
                    helpTextElement.textContent = `Matching Document: $${responseJSON.dynamicsGPDocument.documentTotal.toFixed(2)}`;
                    iconElement.innerHTML =
                        '<i class="fa-solid fa-exclamation-triangle"></i>';
                }
            });
        }
        cityssm.openHtmlModal('contract-addTransaction', {
            onshow(modalElement) {
                sunrise.populateAliases(modalElement);
                modalElement.querySelector('#contractTransactionAdd--contractId').value = contractId;
                const feeGrandTotal = getFeeGrandTotal();
                const transactionGrandTotal = getTransactionGrandTotal();
                transactionAmountElement = modalElement.querySelector('#contractTransactionAdd--transactionAmount');
                transactionAmountElement.min = (-1 * transactionGrandTotal).toFixed(2);
                transactionAmountElement.max = Math.max(feeGrandTotal - transactionGrandTotal, 0).toFixed(2);
                transactionAmountElement.value = Math.max(feeGrandTotal - transactionGrandTotal, 0).toFixed(2);
                if (sunrise.dynamicsGPIntegrationIsEnabled) {
                    externalReceiptNumberElement = modalElement.querySelector('#contractTransactionAdd--externalReceiptNumber');
                    const externalReceiptNumberControlElement = externalReceiptNumberElement.closest('.control');
                    externalReceiptNumberControlElement.classList.add('has-icons-right');
                    externalReceiptNumberControlElement.insertAdjacentHTML('beforeend', '<span class="icon is-small is-right"></span>');
                    externalReceiptNumberControlElement.insertAdjacentHTML('afterend', '<p class="help has-text-right"></p>');
                    externalReceiptNumberElement.addEventListener('change', dynamicsGP_refreshExternalReceiptNumberIcon);
                    transactionAmountElement.addEventListener('change', dynamicsGP_refreshExternalReceiptNumberIcon);
                    dynamicsGP_refreshExternalReceiptNumberIcon();
                }
            },
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                transactionAmountElement.focus();
                addCloseModalFunction = closeModalFunction;
                modalElement
                    .querySelector('form')
                    ?.addEventListener('submit', doAddTransaction);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
                addTransactionButtonElement.focus();
            }
        });
    });
    renderContractFees();
})();

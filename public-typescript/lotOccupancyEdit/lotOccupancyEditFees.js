"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/prefer-module */
Object.defineProperty(exports, "__esModule", { value: true });
let lotOccupancyFees = exports.lotOccupancyFees;
delete exports.lotOccupancyFees;
const lotOccupancyFeesContainerElement = document.querySelector('#container--lotOccupancyFees');
function getFeeGrandTotal() {
    let feeGrandTotal = 0;
    for (const lotOccupancyFee of lotOccupancyFees) {
        feeGrandTotal +=
            (lotOccupancyFee.feeAmount + lotOccupancyFee.taxAmount) *
                lotOccupancyFee.quantity;
    }
    return feeGrandTotal;
}
function editLotOccupancyFeeQuantity(clickEvent) {
    var _a, _b;
    const feeId = Number.parseInt((_b = (_a = clickEvent.currentTarget.closest('tr')) === null || _a === void 0 ? void 0 : _a.dataset.feeId) !== null && _b !== void 0 ? _b : '', 10);
    const fee = lotOccupancyFees.find((possibleFee) => {
        return possibleFee.feeId === feeId;
    });
    let updateCloseModalFunction;
    function doUpdateQuantity(formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doUpdateLotOccupancyFeeQuantity`, formEvent.currentTarget, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                lotOccupancyFees = responseJSON.lotOccupancyFees;
                renderLotOccupancyFees();
                updateCloseModalFunction();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Updating Quantity',
                    message: 'Please try again.',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    cityssm.openHtmlModal('lotOccupancy-editFeeQuantity', {
        onshow(modalElement) {
            var _a, _b;
            ;
            modalElement.querySelector('#lotOccupancyFeeQuantity--lotOccupancyId').value = lotOccupancyId;
            modalElement.querySelector('#lotOccupancyFeeQuantity--feeId').value = fee.feeId.toString();
            modalElement.querySelector('#lotOccupancyFeeQuantity--quantity').valueAsNumber = (_a = fee.quantity) !== null && _a !== void 0 ? _a : 0;
            modalElement.querySelector('#lotOccupancyFeeQuantity--quantityUnit').textContent = (_b = fee.quantityUnit) !== null && _b !== void 0 ? _b : '';
        },
        onshown(modalElement, closeModalFunction) {
            var _a;
            bulmaJS.toggleHtmlClipped();
            updateCloseModalFunction = closeModalFunction;
            modalElement.querySelector('#lotOccupancyFeeQuantity--quantity').focus();
            (_a = modalElement
                .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doUpdateQuantity);
        },
        onremoved() {
            bulmaJS.toggleHtmlClipped();
        }
    });
}
function deleteLotOccupancyFee(clickEvent) {
    const feeId = clickEvent.currentTarget.closest('.container--lotOccupancyFee').dataset.feeId;
    function doDelete() {
        cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doDeleteLotOccupancyFee`, {
            lotOccupancyId,
            feeId
        }, (rawResponseJSON) => {
            var _a;
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                lotOccupancyFees = responseJSON.lotOccupancyFees;
                renderLotOccupancyFees();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Deleting Fee',
                    message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : '',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    bulmaJS.confirm({
        title: 'Delete Fee',
        message: 'Are you sure you want to delete this fee?',
        contextualColorName: 'warning',
        okButton: {
            text: 'Yes, Delete Fee',
            callbackFunction: doDelete
        }
    });
}
function renderLotOccupancyFees() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    if (lotOccupancyFees.length === 0) {
        lotOccupancyFeesContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no fees associated with this record.</p>
        </div>`;
        renderLotOccupancyTransactions();
        return;
    }
    // eslint-disable-next-line no-secrets/no-secrets
    lotOccupancyFeesContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
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
        <td class="has-text-weight-bold has-text-right" id="lotOccupancyFees--feeAmountTotal"></td>
        <td class="is-hidden-print"></td>
      </tr><tr>
        <th colspan="5">Tax</th>
        <td class="has-text-right" id="lotOccupancyFees--taxAmountTotal"></td>
        <td class="is-hidden-print"></td>
      </tr><tr>
        <th colspan="5">Grand Total</th>
        <td class="has-text-weight-bold has-text-right" id="lotOccupancyFees--grandTotal"></td>
        <td class="is-hidden-print"></td>
      </tr></tfoot></table>`;
    let feeAmountTotal = 0;
    let taxAmountTotal = 0;
    for (const lotOccupancyFee of lotOccupancyFees) {
        const tableRowElement = document.createElement('tr');
        tableRowElement.className = 'container--lotOccupancyFee';
        tableRowElement.dataset.feeId = lotOccupancyFee.feeId.toString();
        tableRowElement.dataset.includeQuantity =
            ((_a = lotOccupancyFee.includeQuantity) !== null && _a !== void 0 ? _a : false) ? '1' : '0';
        // eslint-disable-next-line no-unsanitized/property
        tableRowElement.innerHTML = `<td colspan="${lotOccupancyFee.quantity === 1 ? '5' : '1'}">
      ${cityssm.escapeHTML((_b = lotOccupancyFee.feeName) !== null && _b !== void 0 ? _b : '')}<br />
      <span class="tag">${cityssm.escapeHTML((_c = lotOccupancyFee.feeCategory) !== null && _c !== void 0 ? _c : '')}</span>
      </td>
      ${lotOccupancyFee.quantity === 1
            ? ''
            : `<td class="has-text-right">
              $${(_d = lotOccupancyFee.feeAmount) === null || _d === void 0 ? void 0 : _d.toFixed(2)}
              </td>
              <td>&times;</td>
              <td class="has-text-right">${(_e = lotOccupancyFee.quantity) === null || _e === void 0 ? void 0 : _e.toString()}</td>
              <td>=</td>`}
      <td class="has-text-right">
        $${(lotOccupancyFee.feeAmount * lotOccupancyFee.quantity).toFixed(2)}
      </td>
      <td class="is-hidden-print">
      <div class="buttons are-small is-flex-wrap-nowrap is-justify-content-end">
      ${((_f = lotOccupancyFee.includeQuantity) !== null && _f !== void 0 ? _f : false)
            ? `<button class="button is-primary button--editQuantity">
              <span class="icon is-small"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
              <span>Edit</span>
              </button>`
            : ''}
      <button class="button is-danger is-light button--delete" data-tooltip="Delete Fee" type="button">
        <i class="fas fa-trash" aria-hidden="true"></i>
      </button>
      </div>
      </td>`;
        (_g = tableRowElement
            .querySelector('.button--editQuantity')) === null || _g === void 0 ? void 0 : _g.addEventListener('click', editLotOccupancyFeeQuantity);
        (_h = tableRowElement
            .querySelector('.button--delete')) === null || _h === void 0 ? void 0 : _h.addEventListener('click', deleteLotOccupancyFee);
        (_j = lotOccupancyFeesContainerElement
            .querySelector('tbody')) === null || _j === void 0 ? void 0 : _j.append(tableRowElement);
        feeAmountTotal += lotOccupancyFee.feeAmount * lotOccupancyFee.quantity;
        taxAmountTotal += lotOccupancyFee.taxAmount * lotOccupancyFee.quantity;
    }
    ;
    lotOccupancyFeesContainerElement.querySelector('#lotOccupancyFees--feeAmountTotal').textContent = '$' + feeAmountTotal.toFixed(2);
    lotOccupancyFeesContainerElement.querySelector('#lotOccupancyFees--taxAmountTotal').textContent = '$' + taxAmountTotal.toFixed(2);
    lotOccupancyFeesContainerElement.querySelector('#lotOccupancyFees--grandTotal').textContent = '$' + (feeAmountTotal + taxAmountTotal).toFixed(2);
    renderLotOccupancyTransactions();
}
const addFeeButtonElement = document.querySelector('#button--addFee');
addFeeButtonElement.addEventListener('click', () => {
    if (los.hasUnsavedChanges()) {
        bulmaJS.alert({
            message: 'Please save all unsaved changes before adding fees.',
            contextualColorName: 'warning'
        });
        return;
    }
    let feeCategories;
    let feeFilterElement;
    let feeFilterResultsElement;
    function doAddFee(feeId, quantity = 1) {
        cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doAddLotOccupancyFee`, {
            lotOccupancyId,
            feeId,
            quantity
        }, (rawResponseJSON) => {
            var _a;
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                lotOccupancyFees = responseJSON.lotOccupancyFees;
                renderLotOccupancyFees();
                filterFees();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Adding Fee',
                    message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : '',
                    contextualColorName: 'danger'
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
        cityssm.openHtmlModal('lotOccupancy-setFeeQuantity', {
            onshow(modalElement) {
                var _a;
                ;
                modalElement.querySelector('#lotOccupancyFeeQuantity--quantityUnit').textContent = (_a = fee.quantityUnit) !== null && _a !== void 0 ? _a : '';
            },
            onshown(modalElement, closeModalFunction) {
                var _a;
                quantityCloseModalFunction = closeModalFunction;
                quantityElement = modalElement.querySelector('#lotOccupancyFeeQuantity--quantity');
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doSetQuantity);
            }
        });
    }
    function tryAddFee(clickEvent) {
        var _a, _b, _c;
        clickEvent.preventDefault();
        const feeId = Number.parseInt((_a = clickEvent.currentTarget.dataset.feeId) !== null && _a !== void 0 ? _a : '', 10);
        const feeCategoryId = Number.parseInt((_b = clickEvent.currentTarget.dataset.feeCategoryId) !== null && _b !== void 0 ? _b : '', 10);
        const feeCategory = feeCategories.find((currentFeeCategory) => {
            return currentFeeCategory.feeCategoryId === feeCategoryId;
        });
        const fee = feeCategory.fees.find((currentFee) => {
            return currentFee.feeId === feeId;
        });
        if ((_c = fee.includeQuantity) !== null && _c !== void 0 ? _c : false) {
            doSetQuantityAndAddFee(fee);
        }
        else {
            doAddFee(feeId);
        }
    }
    function filterFees() {
        var _a, _b, _c, _d, _e, _f;
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
            categoryContainerElement.innerHTML = `<h4 class="title is-5 mt-2">${cityssm.escapeHTML((_a = feeCategory.feeCategory) !== null && _a !== void 0 ? _a : '')}</h4>
        <div class="panel mb-5"></div>`;
            let hasFees = false;
            for (const fee of feeCategory.fees) {
                // Don't include already applied fees that limit quantity
                if (lotOccupancyFeesContainerElement.querySelector(`.container--lotOccupancyFee[data-fee-id='${fee.feeId}'][data-include-quantity='0']`) !== null) {
                    continue;
                }
                let includeFee = true;
                const feeSearchString = `${(_b = feeCategory.feeCategory) !== null && _b !== void 0 ? _b : ''} ${(_c = fee.feeName) !== null && _c !== void 0 ? _c : ''} ${(_d = fee.feeDescription) !== null && _d !== void 0 ? _d : ''}`.toLowerCase();
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
                const panelBlockElement = document.createElement('a');
                panelBlockElement.className = 'panel-block is-block container--fee';
                panelBlockElement.dataset.feeId = fee.feeId.toString();
                panelBlockElement.dataset.feeCategoryId =
                    feeCategory.feeCategoryId.toString();
                panelBlockElement.href = '#';
                // eslint-disable-next-line no-unsanitized/property
                panelBlockElement.innerHTML = `<strong>${cityssm.escapeHTML((_e = fee.feeName) !== null && _e !== void 0 ? _e : '')}</strong><br />
          <small>
          ${cityssm
                    .escapeHTML((_f = fee.feeDescription) !== null && _f !== void 0 ? _f : '')
                    .replaceAll('\n', '<br />')}
          </small>`;
                panelBlockElement.addEventListener('click', tryAddFee);
                categoryContainerElement.querySelector('.panel').append(panelBlockElement);
            }
            if (hasFees) {
                feeFilterResultsElement.append(categoryContainerElement);
            }
        }
    }
    cityssm.openHtmlModal('lotOccupancy-addFee', {
        onshow(modalElement) {
            feeFilterElement = modalElement.querySelector('#feeSelect--feeName');
            feeFilterResultsElement = modalElement.querySelector('#resultsContainer--feeSelect');
            cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doGetFees`, {
                lotOccupancyId
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
            renderLotOccupancyFees();
        },
        onremoved() {
            bulmaJS.toggleHtmlClipped();
            addFeeButtonElement.focus();
        }
    });
});
let lotOccupancyTransactions = exports.lotOccupancyTransactions;
delete exports.lotOccupancyTransactions;
const lotOccupancyTransactionsContainerElement = document.querySelector('#container--lotOccupancyTransactions');
function getTransactionGrandTotal() {
    let transactionGrandTotal = 0;
    for (const lotOccupancyTransaction of lotOccupancyTransactions) {
        transactionGrandTotal += lotOccupancyTransaction.transactionAmount;
    }
    return transactionGrandTotal;
}
function editLotOccupancyTransaction(clickEvent) {
    var _a, _b;
    const transactionIndex = Number.parseInt((_b = (_a = clickEvent.currentTarget.closest('tr')) === null || _a === void 0 ? void 0 : _a.dataset.transactionIndex) !== null && _b !== void 0 ? _b : '', 10);
    const transaction = lotOccupancyTransactions.find((possibleTransaction) => {
        return possibleTransaction.transactionIndex === transactionIndex;
    });
    let editCloseModalFunction;
    function doEdit(formEvent) {
        formEvent.preventDefault();
        cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doUpdateLotOccupancyTransaction`, formEvent.currentTarget, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                lotOccupancyTransactions = responseJSON.lotOccupancyTransactions;
                renderLotOccupancyTransactions();
                editCloseModalFunction();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Updating Transaction',
                    message: 'Please try again.',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    cityssm.openHtmlModal('lotOccupancy-editTransaction', {
        onshow(modalElement) {
            var _a, _b, _c, _d, _e, _f;
            los.populateAliases(modalElement);
            modalElement.querySelector('#lotOccupancyTransactionEdit--lotOccupancyId').value = lotOccupancyId;
            modalElement.querySelector('#lotOccupancyTransactionEdit--transactionIndex').value = (_b = (_a = transaction.transactionIndex) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
            modalElement.querySelector('#lotOccupancyTransactionEdit--transactionAmount').value = transaction.transactionAmount.toFixed(2);
            modalElement.querySelector('#lotOccupancyTransactionEdit--externalReceiptNumber').value = (_c = transaction.externalReceiptNumber) !== null && _c !== void 0 ? _c : '';
            modalElement.querySelector('#lotOccupancyTransactionEdit--transactionNote').value = (_d = transaction.transactionNote) !== null && _d !== void 0 ? _d : '';
            modalElement.querySelector('#lotOccupancyTransactionEdit--transactionDateString').value = (_e = transaction.transactionDateString) !== null && _e !== void 0 ? _e : '';
            modalElement.querySelector('#lotOccupancyTransactionEdit--transactionTimeString').value = (_f = transaction.transactionTimeString) !== null && _f !== void 0 ? _f : '';
        },
        onshown(modalElement, closeModalFunction) {
            var _a;
            bulmaJS.toggleHtmlClipped();
            los.initializeDatePickers(modalElement);
            modalElement.querySelector('#lotOccupancyTransactionEdit--transactionAmount').focus();
            (_a = modalElement.querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doEdit);
            editCloseModalFunction = closeModalFunction;
        },
        onremoved() {
            bulmaJS.toggleHtmlClipped();
        }
    });
}
function deleteLotOccupancyTransaction(clickEvent) {
    const transactionIndex = clickEvent.currentTarget.closest('.container--lotOccupancyTransaction').dataset.transactionIndex;
    function doDelete() {
        cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doDeleteLotOccupancyTransaction`, {
            lotOccupancyId,
            transactionIndex
        }, (rawResponseJSON) => {
            var _a;
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                lotOccupancyTransactions = responseJSON.lotOccupancyTransactions;
                renderLotOccupancyTransactions();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Deleting Transaction',
                    message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : '',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    bulmaJS.confirm({
        title: 'Delete Trasnaction',
        message: 'Are you sure you want to delete this transaction?',
        contextualColorName: 'warning',
        okButton: {
            text: 'Yes, Delete Transaction',
            callbackFunction: doDelete
        }
    });
}
function renderLotOccupancyTransactions() {
    var _a, _b, _c, _d, _e, _f, _g;
    if (lotOccupancyTransactions.length === 0) {
        // eslint-disable-next-line no-unsanitized/property
        lotOccupancyTransactionsContainerElement.innerHTML = `<div class="message ${lotOccupancyFees.length === 0 ? 'is-info' : 'is-warning'}">
      <p class="message-body">There are no transactions associated with this record.</p>
      </div>`;
        return;
    }
    // eslint-disable-next-line no-unsanitized/property
    lotOccupancyTransactionsContainerElement.innerHTML = `<table class="table is-fullwidth is-striped is-hoverable">
      <thead><tr>
        <th class="has-width-1">Date</th>
        <th>${los.escapedAliases.ExternalReceiptNumber}</th>
        <th class="has-text-right has-width-1">Amount</th>
        <th class="has-width-1 is-hidden-print"><span class="is-sr-only">Options</span></th>
      </tr></thead>
      <tbody></tbody>
      <tfoot><tr>
        <th colspan="2">Transaction Total</th>
        <td class="has-text-weight-bold has-text-right" id="lotOccupancyTransactions--grandTotal"></td>
        <td class="is-hidden-print"></td>
      </tr></tfoot>
      </table>`;
    let transactionGrandTotal = 0;
    for (const lotOccupancyTransaction of lotOccupancyTransactions) {
        transactionGrandTotal += lotOccupancyTransaction.transactionAmount;
        const tableRowElement = document.createElement('tr');
        tableRowElement.className = 'container--lotOccupancyTransaction';
        tableRowElement.dataset.transactionIndex =
            (_a = lotOccupancyTransaction.transactionIndex) === null || _a === void 0 ? void 0 : _a.toString();
        let externalReceiptNumberHTML = '';
        if (lotOccupancyTransaction.externalReceiptNumber !== '') {
            externalReceiptNumberHTML = cityssm.escapeHTML((_b = lotOccupancyTransaction.externalReceiptNumber) !== null && _b !== void 0 ? _b : '');
            if (los.dynamicsGPIntegrationIsEnabled) {
                if (lotOccupancyTransaction.dynamicsGPDocument === undefined) {
                    externalReceiptNumberHTML += ` <span data-tooltip="No Matching Document Found">
            <i class="fas fa-times-circle has-text-danger" aria-label="No Matching Document Found"></i>
            </span>`;
                }
                else if (lotOccupancyTransaction.dynamicsGPDocument.documentTotal.toFixed(2) === lotOccupancyTransaction.transactionAmount.toFixed(2)) {
                    externalReceiptNumberHTML += ` <span data-tooltip="Matching Document Found">
            <i class="fas fa-check-circle has-text-success" aria-label="Matching Document Found"></i>
            </span>`;
                }
                else {
                    externalReceiptNumberHTML += ` <span data-tooltip="Matching Document: $${lotOccupancyTransaction.dynamicsGPDocument.documentTotal.toFixed(2)}">
            <i class="fas fa-check-circle has-text-warning" aria-label="Matching Document: $${lotOccupancyTransaction.dynamicsGPDocument.documentTotal.toFixed(2)}"></i>
            </span>`;
                }
            }
            externalReceiptNumberHTML += '<br />';
        }
        // eslint-disable-next-line no-unsanitized/property
        tableRowElement.innerHTML = `<td>
      ${cityssm.escapeHTML((_c = lotOccupancyTransaction.transactionDateString) !== null && _c !== void 0 ? _c : '')}
      </td>
      <td>
        ${externalReceiptNumberHTML}
        <small>${cityssm.escapeHTML((_d = lotOccupancyTransaction.transactionNote) !== null && _d !== void 0 ? _d : '')}</small>
      </td>
      <td class="has-text-right">
        $${cityssm.escapeHTML(lotOccupancyTransaction.transactionAmount.toFixed(2))}
      </td>
      <td class="is-hidden-print">
        <div class="buttons are-small is-flex-wrap-nowrap is-justify-content-end">
          <button class="button is-primary button--edit" type="button">
            <span class="icon"><i class="fas fa-pencil-alt" aria-hidden="true"></i></span>
            <span>Edit</span>
          </button>
          <button class="button is-danger is-light button--delete" data-tooltip="Delete Transaction" type="button">
            <i class="fas fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      </td>`;
        (_e = tableRowElement
            .querySelector('.button--edit')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', editLotOccupancyTransaction);
        (_f = tableRowElement
            .querySelector('.button--delete')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', deleteLotOccupancyTransaction);
        (_g = lotOccupancyTransactionsContainerElement
            .querySelector('tbody')) === null || _g === void 0 ? void 0 : _g.append(tableRowElement);
    }
    ;
    lotOccupancyTransactionsContainerElement.querySelector('#lotOccupancyTransactions--grandTotal').textContent = '$' + transactionGrandTotal.toFixed(2);
    const feeGrandTotal = getFeeGrandTotal();
    if (feeGrandTotal.toFixed(2) !== transactionGrandTotal.toFixed(2)) {
        lotOccupancyTransactionsContainerElement.insertAdjacentHTML('afterbegin', `<div class="message is-warning">
        <div class="message-body">
        <div class="level">
          <div class="level-left">
            <div class="level-item">Outstanding Balance</div>
          </div>
          <div class="level-right">
            <div class="level-item">$${cityssm.escapeHTML((feeGrandTotal - transactionGrandTotal).toFixed(2))}</div>
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
        cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doAddLotOccupancyTransaction`, submitEvent.currentTarget, (rawResponseJSON) => {
            var _a;
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                lotOccupancyTransactions = responseJSON.lotOccupancyTransactions;
                addCloseModalFunction();
                renderLotOccupancyTransactions();
            }
            else {
                bulmaJS.confirm({
                    title: 'Error Adding Transaction',
                    message: (_a = responseJSON.errorMessage) !== null && _a !== void 0 ? _a : '',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    function dynamicsGP_refreshExternalReceiptNumberIcon() {
        var _a, _b;
        const externalReceiptNumber = externalReceiptNumberElement.value;
        const iconElement = (_a = externalReceiptNumberElement
            .closest('.control')) === null || _a === void 0 ? void 0 : _a.querySelector('.icon');
        const helpTextElement = (_b = externalReceiptNumberElement
            .closest('.field')) === null || _b === void 0 ? void 0 : _b.querySelector('.help');
        if (externalReceiptNumber === '') {
            helpTextElement.innerHTML = '&nbsp;';
            iconElement.innerHTML = '<i class="fas fa-minus" aria-hidden="true"></i>';
            return;
        }
        cityssm.postJSON(`${los.urlPrefix}/lotOccupancies/doGetDynamicsGPDocument`, {
            externalReceiptNumber
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (!responseJSON.success ||
                responseJSON.dynamicsGPDocument === undefined) {
                helpTextElement.textContent = 'No Matching Document Found';
                iconElement.innerHTML =
                    '<i class="fas fa-times-circle" aria-hidden="true"></i>';
            }
            else if (transactionAmountElement.valueAsNumber ===
                responseJSON.dynamicsGPDocument.documentTotal) {
                helpTextElement.textContent = 'Matching Document Found';
                iconElement.innerHTML =
                    '<i class="fas fa-check-circle" aria-hidden="true"></i>';
            }
            else {
                helpTextElement.textContent =
                    'Matching Document: $' +
                        responseJSON.dynamicsGPDocument.documentTotal.toFixed(2);
                iconElement.innerHTML =
                    '<i class="fas fa-exclamation-triangle" aria-hidden="true"></i>';
            }
        });
    }
    cityssm.openHtmlModal('lotOccupancy-addTransaction', {
        onshow(modalElement) {
            los.populateAliases(modalElement);
            modalElement.querySelector('#lotOccupancyTransactionAdd--lotOccupancyId').value = lotOccupancyId.toString();
            const feeGrandTotal = getFeeGrandTotal();
            const transactionGrandTotal = getTransactionGrandTotal();
            transactionAmountElement = modalElement.querySelector('#lotOccupancyTransactionAdd--transactionAmount');
            transactionAmountElement.min = (-1 * transactionGrandTotal).toFixed(2);
            transactionAmountElement.max = Math.max(feeGrandTotal - transactionGrandTotal, 0).toFixed(2);
            transactionAmountElement.value = Math.max(feeGrandTotal - transactionGrandTotal, 0).toFixed(2);
            if (los.dynamicsGPIntegrationIsEnabled) {
                externalReceiptNumberElement = modalElement.querySelector(
                // eslint-disable-next-line no-secrets/no-secrets
                '#lotOccupancyTransactionAdd--externalReceiptNumber');
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
            var _a;
            bulmaJS.toggleHtmlClipped();
            transactionAmountElement.focus();
            addCloseModalFunction = closeModalFunction;
            (_a = modalElement
                .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', doAddTransaction);
        },
        onremoved() {
            bulmaJS.toggleHtmlClipped();
            addTransactionButtonElement.focus();
        }
    });
});
renderLotOccupancyFees();

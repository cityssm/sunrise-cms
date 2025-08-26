"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDynamicsGPDocument = getDynamicsGPDocument;
const dynamics_gp_1 = require("@cityssm/dynamics-gp");
const debug_1 = require("debug");
const debug_config_js_1 = require("../../debug.config.js");
const config_helpers_js_1 = require("../../helpers/config.helpers.js");
const debug = (0, debug_1.default)(`${debug_config_js_1.DEBUG_NAMESPACE}:dynamicsGP.helpers:${process.pid}`);
let gp;
if ((0, config_helpers_js_1.getConfigProperty)('integrations.dynamicsGP.integrationIsEnabled')) {
    gp = new dynamics_gp_1.DynamicsGP((0, config_helpers_js_1.getConfigProperty)('integrations.dynamicsGP.mssqlConfig'));
}
async function getDynamicsGPDocument(documentNumber) {
    if (!(0, config_helpers_js_1.getConfigProperty)('integrations.dynamicsGP.integrationIsEnabled')) {
        return undefined;
    }
    let document;
    for (const lookupType of (0, config_helpers_js_1.getConfigProperty)(
    // eslint-disable-next-line no-secrets/no-secrets
    'integrations.dynamicsGP.lookupOrder')) {
        try {
            document = await _getDynamicsGPDocument(documentNumber, lookupType);
        }
        catch (error) {
            debug(`Error fetching Dynamics GP document for ${lookupType}:`);
            debug(error);
        }
        if (document !== undefined) {
            break;
        }
    }
    return document;
}
async function _getDynamicsGPDocument(documentNumber, lookupType) {
    let document;
    switch (lookupType) {
        case 'diamond/cashReceipt': {
            let receipt = await gp.getDiamondCashReceiptByDocumentNumber(documentNumber);
            if (receipt !== undefined) {
                receipt = filterCashReceipt(receipt);
            }
            if (receipt !== undefined) {
                document = {
                    documentType: 'Cash Receipt',
                    documentNumber: receipt.documentNumber.toString(),
                    documentDate: receipt.documentDate,
                    documentDescription: [
                        receipt.description,
                        receipt.description2,
                        receipt.description3,
                        receipt.description4,
                        receipt.description5
                    ],
                    documentTotal: receipt.total
                };
            }
            break;
        }
        case 'diamond/extendedInvoice': {
            let invoice = await gp.getDiamondExtendedInvoiceByInvoiceNumber(documentNumber);
            if (invoice !== undefined) {
                invoice = filterExtendedInvoice(invoice);
            }
            if (invoice !== undefined) {
                document = {
                    documentType: 'Invoice',
                    documentNumber: invoice.invoiceNumber,
                    documentDate: invoice.documentDate,
                    documentDescription: [
                        invoice.comment1,
                        invoice.comment2,
                        invoice.comment3,
                        invoice.comment4
                    ],
                    documentTotal: invoice.documentAmount
                };
            }
            break;
        }
        case 'invoice': {
            let invoice = await gp.getInvoiceByInvoiceNumber(documentNumber);
            if (invoice !== undefined) {
                invoice = filterInvoice(invoice);
            }
            if (invoice !== undefined) {
                document = {
                    documentType: 'Invoice',
                    documentNumber: invoice.invoiceNumber,
                    documentDate: invoice.documentDate,
                    documentDescription: [
                        invoice.comment1,
                        invoice.comment2,
                        invoice.comment3,
                        invoice.comment4
                    ],
                    documentTotal: invoice.documentAmount
                };
            }
            break;
        }
    }
    return document;
}
function filterCashReceipt(cashReceipt) {
    var _a, _b;
    const accountCodes = (0, config_helpers_js_1.getConfigProperty)('integrations.dynamicsGP.accountCodes');
    if (accountCodes.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        for (const detail of (_a = cashReceipt === null || cashReceipt === void 0 ? void 0 : cashReceipt.details) !== null && _a !== void 0 ? _a : []) {
            if (accountCodes.includes(detail.accountCode)) {
                return cashReceipt;
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        for (const distribution of (_b = cashReceipt === null || cashReceipt === void 0 ? void 0 : cashReceipt.distributions) !== null && _b !== void 0 ? _b : []) {
            if (accountCodes.includes(distribution.accountCode)) {
                return cashReceipt;
            }
        }
        return undefined;
    }
    return cashReceipt;
}
function filterExtendedInvoice(invoice) {
    var _a;
    if (filterInvoice(invoice) === undefined) {
        return undefined;
    }
    const trialBalanceCodes = (0, config_helpers_js_1.getConfigProperty)('integrations.dynamicsGP.trialBalanceCodes');
    if (trialBalanceCodes.length > 0 &&
        trialBalanceCodes.includes((_a = invoice.trialBalanceCode) !== null && _a !== void 0 ? _a : '')) {
        return invoice;
    }
    return undefined;
}
function filterInvoice(invoice) {
    const itemNumbers = (0, config_helpers_js_1.getConfigProperty)('integrations.dynamicsGP.itemNumbers');
    for (const itemNumber of itemNumbers) {
        const found = invoice.lineItems.some((itemRecord) => itemRecord.itemNumber === itemNumber);
        if (!found) {
            return undefined;
        }
    }
    return invoice;
}

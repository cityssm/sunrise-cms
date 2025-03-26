// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable security/detect-object-injection */
import * as dateTimeFunctions from '@cityssm/utils-datetime';
import getBurialSite from '../database/getBurialSite.js';
import getContract from '../database/getContract.js';
import getWorkOrder from '../database/getWorkOrder.js';
import * as configFunctions from './config.helpers.js';
import * as contractFunctions from './contracts.helpers.js';
const screenPrintConfigs = {
    contract: {
        params: ['contractId'],
        title: "Burial Site Contract Print"
    }
};
export function getScreenPrintConfig(printName) {
    return screenPrintConfigs[printName];
}
const pdfPrintConfigs = {
    workOrder: {
        params: ['workOrderId'],
        title: 'Work Order Field Sheet'
    },
    'workOrder-commentLog': {
        params: ['workOrderId'],
        title: 'Work Order Field Sheet - Comment Log'
    },
    // Occupancy
    'ssm.cemetery.burialPermit': {
        params: ['contractId'],
        title: 'Burial Permit'
    },
    'ssm.cemetery.contract': {
        params: ['contractId'],
        title: 'Contract for Purchase of Interment Rights'
    }
};
export function getPdfPrintConfig(printName) {
    return pdfPrintConfigs[printName];
}
export function getPrintConfig(screenOrPdfPrintName) {
    const printNameSplit = screenOrPdfPrintName.split('/');
    switch (printNameSplit[0]) {
        case 'pdf': {
            return getPdfPrintConfig(printNameSplit[1]);
        }
        case 'screen': {
            return getScreenPrintConfig(printNameSplit[1]);
        }
    }
    return undefined;
}
export async function getReportData(printConfig, requestQuery) {
    const reportData = {
        headTitle: printConfig.title,
        configFunctions,
        contractFunctions,
        dateTimeFunctions
    };
    if (printConfig.params.includes('contractId') &&
        typeof requestQuery.contractId === 'string') {
        const contract = await getContract(requestQuery.contractId);
        if (contract !== undefined && (contract.burialSiteId ?? -1) !== -1) {
            reportData.burialSite = await getBurialSite(contract.burialSiteId ?? -1);
        }
        reportData.contract = contract;
    }
    if (printConfig.params.includes('workOrderId') &&
        typeof requestQuery.workOrderId === 'string') {
        reportData.workOrder = await getWorkOrder(requestQuery.workOrderId, {
            includeBurialSites: true,
            includeComments: true,
            includeMilestones: true
        });
    }
    return reportData;
}

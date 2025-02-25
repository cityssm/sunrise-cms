// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable security/detect-object-injection */
import * as dateTimeFunctions from '@cityssm/utils-datetime';
import getBurialSite from '../database/getBurialSite.js';
import getBurialSiteContract from '../database/getBurialSiteContract.js';
import getWorkOrder from '../database/getWorkOrder.js';
import * as burialSiteContractFunctions from './burialSiteContracts.helpers.js';
import * as configFunctions from './config.helpers.js';
const screenPrintConfigs = {
    burialSiteContract: {
        title: `Burial Site Contract Print`,
        params: ['burialSiteContractId']
    }
};
export function getScreenPrintConfig(printName) {
    return screenPrintConfigs[printName];
}
const pdfPrintConfigs = {
    workOrder: {
        title: 'Work Order Field Sheet',
        params: ['workOrderId']
    },
    'workOrder-commentLog': {
        title: 'Work Order Field Sheet - Comment Log',
        params: ['workOrderId']
    },
    // Occupancy
    'ssm.cemetery.burialPermit': {
        title: 'Burial Permit',
        params: ['burialSiteContractId']
    },
    'ssm.cemetery.contract': {
        title: 'Contract for Purchase of Interment Rights',
        params: ['burialSiteContractId']
    }
};
export function getPdfPrintConfig(printName) {
    return pdfPrintConfigs[printName];
}
export function getPrintConfig(screenOrPdfPrintName) {
    const printNameSplit = screenOrPdfPrintName.split('/');
    switch (printNameSplit[0]) {
        case 'screen': {
            return getScreenPrintConfig(printNameSplit[1]);
        }
        case 'pdf': {
            return getPdfPrintConfig(printNameSplit[1]);
        }
    }
    return undefined;
}
export async function getReportData(printConfig, requestQuery) {
    const reportData = {
        headTitle: printConfig.title,
        configFunctions,
        dateTimeFunctions,
        burialSiteContractFunctions
    };
    if (printConfig.params.includes('burialSiteContractId') &&
        typeof requestQuery.burialSiteContractId === 'string') {
        const burialSiteContract = await getBurialSiteContract(requestQuery.burialSiteContractId);
        if (burialSiteContract !== undefined && (burialSiteContract.burialSiteId ?? -1) !== -1) {
            reportData.burialSite = await getBurialSite(burialSiteContract.burialSiteId ?? -1);
        }
        reportData.burialSiteContract = burialSiteContract;
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

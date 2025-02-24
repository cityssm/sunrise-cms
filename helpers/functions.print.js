import * as dateTimeFunctions from '@cityssm/utils-datetime';
import getLot from '../database/getLot.js';
import getLotOccupancy from '../database/getLotOccupancy.js';
import getWorkOrder from '../database/getWorkOrder.js';
import * as configFunctions from './config.helpers.js';
import * as lotOccupancyFunctions from './functions.lotOccupancy.js';
const screenPrintConfigs = {
    lotOccupancy: {
        title: `${configFunctions.getConfigProperty('aliases.lot')} ${configFunctions.getConfigProperty('aliases.occupancy')} Print`,
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
        lotOccupancyFunctions
    };
    if (printConfig.params.includes('burialSiteContractId') &&
        typeof requestQuery.burialSiteContractId === 'string') {
        const lotOccupancy = await getLotOccupancy(requestQuery.burialSiteContractId);
        if (lotOccupancy !== undefined && (lotOccupancy.lotId ?? -1) !== -1) {
            reportData.lot = await getLot(lotOccupancy.lotId ?? -1);
        }
        reportData.lotOccupancy = lotOccupancy;
    }
    if (printConfig.params.includes('workOrderId') &&
        typeof requestQuery.workOrderId === 'string') {
        reportData.workOrder = await getWorkOrder(requestQuery.workOrderId, {
            includeLotsAndLotOccupancies: true,
            includeComments: true,
            includeMilestones: true
        });
    }
    return reportData;
}

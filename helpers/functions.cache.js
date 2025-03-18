// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/init-declarations */
import cluster from 'node:cluster';
import Debug from 'debug';
import getBurialSiteStatusesFromDatabase from '../database/getBurialSiteStatuses.js';
import getBurialSiteTypesFromDatabase from '../database/getBurialSiteTypes.js';
import getCommittalTypesFromDatabase from '../database/getCommittalTypes.js';
import getContractTypeFieldsFromDatabase from '../database/getContractTypeFields.js';
import getContractTypesFromDatabase from '../database/getContractTypes.js';
import getIntermentContainerTypesFromDatabase from '../database/getIntermentContainerTypes.js';
import getWorkOrderMilestoneTypesFromDatabase from '../database/getWorkOrderMilestoneTypes.js';
import getWorkOrderTypesFromDatabase from '../database/getWorkOrderTypes.js';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from './config.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:functions.cache:${process.pid}`);
/*
 * Burial Site Statuses
 */
let burialSiteStatuses;
export async function getBurialSiteStatuses() {
    if (burialSiteStatuses === undefined) {
        burialSiteStatuses = await getBurialSiteStatusesFromDatabase();
    }
    return burialSiteStatuses;
}
export async function getBurialSiteStatusById(burialSiteStatusId) {
    const cachedStatuses = await getBurialSiteStatuses();
    return cachedStatuses.find((currentStatus) => currentStatus.burialSiteStatusId === burialSiteStatusId);
}
export async function getBurialSiteStatusByBurialSiteStatus(burialSiteStatus) {
    const cachedStatuses = await getBurialSiteStatuses();
    const statusLowerCase = burialSiteStatus.toLowerCase();
    return cachedStatuses.find((currentStatus) => currentStatus.burialSiteStatus.toLowerCase() === statusLowerCase);
}
function clearBurialSiteStatusesCache() {
    burialSiteStatuses = undefined;
}
/*
 * Burial Site Types
 */
let burialSiteTypes;
export async function getBurialSiteTypes() {
    if (burialSiteTypes === undefined) {
        burialSiteTypes = await getBurialSiteTypesFromDatabase();
    }
    return burialSiteTypes;
}
export async function getBurialSiteTypeById(burialSiteTypeId) {
    const cachedTypes = await getBurialSiteTypes();
    return cachedTypes.find((currentType) => currentType.burialSiteTypeId === burialSiteTypeId);
}
export async function getBurialSiteTypesByBurialSiteType(burialSiteType) {
    const cachedTypes = await getBurialSiteTypes();
    const typeLowerCase = burialSiteType.toLowerCase();
    return cachedTypes.find((currentType) => currentType.burialSiteType.toLowerCase() === typeLowerCase);
}
function clearBurialSiteTypesCache() {
    burialSiteTypes = undefined;
}
/*
 * Contract Types
 */
let contractTypes;
let allContractTypeFields;
export async function getContractTypes() {
    if (contractTypes === undefined) {
        contractTypes = await getContractTypesFromDatabase();
    }
    return contractTypes;
}
export async function getAllContractTypeFields() {
    if (allContractTypeFields === undefined) {
        allContractTypeFields = await getContractTypeFieldsFromDatabase();
    }
    return allContractTypeFields;
}
export async function getContractTypeById(contractTypeId) {
    const cachedTypes = await getContractTypes();
    return cachedTypes.find((currentType) => currentType.contractTypeId === contractTypeId);
}
export async function getContractTypeByContractType(contractTypeString) {
    const cachedTypes = await getContractTypes();
    const typeLowerCase = contractTypeString.toLowerCase();
    return cachedTypes.find((currentType) => currentType.contractType.toLowerCase() === typeLowerCase);
}
export async function getContractTypePrintsById(contractTypeId) {
    const contractType = await getContractTypeById(contractTypeId);
    if (contractType?.contractTypePrints === undefined ||
        contractType.contractTypePrints.length === 0) {
        return [];
    }
    if (contractType.contractTypePrints.includes('*')) {
        return getConfigProperty('settings.contracts.prints');
    }
    return contractType.contractTypePrints ?? [];
}
function clearContractTypesCache() {
    contractTypes = undefined;
    allContractTypeFields = undefined;
}
/*
 * Interment Container Types
 */
let intermentContainerTypes;
export async function getIntermentContainerTypes() {
    if (intermentContainerTypes === undefined) {
        intermentContainerTypes = await getIntermentContainerTypesFromDatabase();
    }
    return intermentContainerTypes;
}
export async function getIntermentContainerTypeById(intermentContainerTypeId) {
    const cachedContainerTypes = await getIntermentContainerTypes();
    return cachedContainerTypes.find((currentContainerType) => currentContainerType.intermentContainerTypeId === intermentContainerTypeId);
}
function clearIntermentContainerTypesCache() {
    intermentContainerTypes = undefined;
}
/*
 * Committal Types
 */
let committalTypes;
export async function getCommittalTypes() {
    if (committalTypes === undefined) {
        committalTypes = await getCommittalTypesFromDatabase();
    }
    return committalTypes;
}
export async function getCommittalTypeById(committalTypeId) {
    const cachedCommittalTypes = await getCommittalTypes();
    return cachedCommittalTypes.find((currentCommittalType) => currentCommittalType.committalTypeId === committalTypeId);
}
function clearCommittalTypesCache() {
    committalTypes = undefined;
}
/*
 * Work Order Types
 */
let workOrderTypes;
export async function getWorkOrderTypes() {
    if (workOrderTypes === undefined) {
        workOrderTypes = await getWorkOrderTypesFromDatabase();
    }
    return workOrderTypes;
}
export async function getWorkOrderTypeById(workOrderTypeId) {
    const cachedWorkOrderTypes = await getWorkOrderTypes();
    return cachedWorkOrderTypes.find((currentWorkOrderType) => currentWorkOrderType.workOrderTypeId === workOrderTypeId);
}
function clearWorkOrderTypesCache() {
    workOrderTypes = undefined;
}
/*
 * Work Order Milestone Types
 */
let workOrderMilestoneTypes;
export async function getWorkOrderMilestoneTypes() {
    if (workOrderMilestoneTypes === undefined) {
        workOrderMilestoneTypes = await getWorkOrderMilestoneTypesFromDatabase();
    }
    return workOrderMilestoneTypes;
}
export async function getWorkOrderMilestoneTypeById(workOrderMilestoneTypeId) {
    const cachedWorkOrderMilestoneTypes = await getWorkOrderMilestoneTypes();
    return cachedWorkOrderMilestoneTypes.find((currentWorkOrderMilestoneType) => currentWorkOrderMilestoneType.workOrderMilestoneTypeId ===
        workOrderMilestoneTypeId);
}
export async function getWorkOrderMilestoneTypeByWorkOrderMilestoneType(workOrderMilestoneTypeString) {
    const cachedWorkOrderMilestoneTypes = await getWorkOrderMilestoneTypes();
    const workOrderMilestoneTypeLowerCase = workOrderMilestoneTypeString.toLowerCase();
    return cachedWorkOrderMilestoneTypes.find((currentWorkOrderMilestoneType) => currentWorkOrderMilestoneType.workOrderMilestoneType.toLowerCase() ===
        workOrderMilestoneTypeLowerCase);
}
export async function preloadCaches() {
    debug('Preloading caches');
    await getBurialSiteStatuses();
    await getBurialSiteTypes();
    await getContractTypes();
    await getCommittalTypes();
    await getIntermentContainerTypes();
    await getWorkOrderTypes();
    await getWorkOrderMilestoneTypes();
}
export function clearCaches() {
    clearBurialSiteStatusesCache();
    clearBurialSiteTypesCache();
    clearContractTypesCache();
    clearCommittalTypesCache();
    clearIntermentContainerTypesCache();
    clearWorkOrderTypesCache();
    clearWorkOrderMilestoneTypesCache();
}
function clearWorkOrderMilestoneTypesCache() {
    workOrderMilestoneTypes = undefined;
}
export function clearCacheByTableName(tableName, relayMessage = true) {
    switch (tableName) {
        case 'BurialSiteStatuses': {
            clearBurialSiteStatusesCache();
            break;
        }
        case 'BurialSiteTypes':
        case 'BurialSiteTypeFields': {
            clearBurialSiteTypesCache();
            break;
        }
        case 'ContractTypes':
        case 'ContractTypeFields':
        case 'ContractTypePrints': {
            clearContractTypesCache();
            break;
        }
        case 'IntermentContainerTypes': {
            clearIntermentContainerTypesCache();
            break;
        }
        case 'CommittalTypes': {
            clearCommittalTypesCache();
            break;
        }
        case 'WorkOrderMilestoneTypes': {
            clearWorkOrderMilestoneTypesCache();
            break;
        }
        case 'WorkOrderTypes': {
            clearWorkOrderTypesCache();
            break;
        }
        default: {
            return;
        }
    }
    try {
        if (relayMessage && cluster.isWorker) {
            const workerMessage = {
                messageType: 'clearCache',
                tableName,
                timeMillis: Date.now(),
                pid: process.pid
            };
            debug(`Sending clear cache from worker: ${tableName}`);
            if (process.send !== undefined) {
                process.send(workerMessage);
            }
        }
    }
    catch {
        // ignore
    }
}
process.on('message', (message) => {
    if (message.messageType === 'clearCache' && message.pid !== process.pid) {
        debug(`Clearing cache: ${message.tableName}`);
        clearCacheByTableName(message.tableName, false);
    }
});

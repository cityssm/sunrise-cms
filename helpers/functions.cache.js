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
const debug = Debug(`${DEBUG_NAMESPACE}:functions.cache:${process.pid.toString().padEnd(5)}`);
/*
 * Burial Site Statuses
 */
let burialSiteStatuses;
export function getBurialSiteStatusByBurialSiteStatus(burialSiteStatus) {
    const cachedStatuses = getBurialSiteStatuses();
    const statusLowerCase = burialSiteStatus.toLowerCase();
    return cachedStatuses.find((currentStatus) => currentStatus.burialSiteStatus.toLowerCase() === statusLowerCase);
}
export function getBurialSiteStatusById(burialSiteStatusId) {
    const cachedStatuses = getBurialSiteStatuses();
    return cachedStatuses.find((currentStatus) => currentStatus.burialSiteStatusId === burialSiteStatusId);
}
export function getBurialSiteStatuses() {
    burialSiteStatuses ??= getBurialSiteStatusesFromDatabase();
    return burialSiteStatuses;
}
function clearBurialSiteStatusesCache() {
    burialSiteStatuses = undefined;
}
/*
 * Burial Site Types
 */
let burialSiteTypes;
export function getBurialSiteTypeById(burialSiteTypeId) {
    const cachedTypes = getBurialSiteTypes();
    return cachedTypes.find((currentType) => currentType.burialSiteTypeId === burialSiteTypeId);
}
export function getBurialSiteTypes(includeDeleted = false) {
    burialSiteTypes ??= getBurialSiteTypesFromDatabase(includeDeleted);
    return burialSiteTypes;
}
export function getBurialSiteTypesByBurialSiteType(burialSiteType, includeDeleted = false) {
    const cachedTypes = getBurialSiteTypes(includeDeleted);
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
export function getAllContractTypeFields() {
    allContractTypeFields ??= getContractTypeFieldsFromDatabase();
    return allContractTypeFields;
}
export function getContractTypeByContractType(contractTypeString) {
    const cachedTypes = getContractTypes();
    const typeLowerCase = contractTypeString.toLowerCase();
    return cachedTypes.find((currentType) => currentType.contractType.toLowerCase() === typeLowerCase);
}
export function getContractTypeById(contractTypeId) {
    const cachedTypes = getContractTypes();
    return cachedTypes.find((currentType) => currentType.contractTypeId === contractTypeId);
}
export function getContractTypePrintsById(contractTypeId) {
    const contractType = getContractTypeById(contractTypeId);
    if (contractType?.contractTypePrints === undefined ||
        contractType.contractTypePrints.length === 0) {
        return [];
    }
    if (contractType.contractTypePrints.includes('*')) {
        return getConfigProperty('settings.contracts.prints');
    }
    return contractType.contractTypePrints ?? [];
}
export function getContractTypes() {
    contractTypes ??= getContractTypesFromDatabase();
    return contractTypes;
}
function clearContractTypesCache() {
    contractTypes = undefined;
    allContractTypeFields = undefined;
}
/*
 * Interment Container Types
 */
let intermentContainerTypes;
export function getIntermentContainerTypeById(intermentContainerTypeId) {
    const cachedContainerTypes = getIntermentContainerTypes();
    return cachedContainerTypes.find((currentContainerType) => currentContainerType.intermentContainerTypeId === intermentContainerTypeId);
}
export function getIntermentContainerTypes() {
    intermentContainerTypes ??= getIntermentContainerTypesFromDatabase();
    return intermentContainerTypes;
}
function clearIntermentContainerTypesCache() {
    intermentContainerTypes = undefined;
}
/*
 * Committal Types
 */
let committalTypes;
export function getCommittalTypeById(committalTypeId) {
    const cachedCommittalTypes = getCommittalTypes();
    return cachedCommittalTypes.find((currentCommittalType) => currentCommittalType.committalTypeId === committalTypeId);
}
export function getCommittalTypes() {
    committalTypes ??= getCommittalTypesFromDatabase();
    return committalTypes;
}
function clearCommittalTypesCache() {
    committalTypes = undefined;
}
/*
 * Work Order Types
 */
let workOrderTypes;
export function getWorkOrderTypeById(workOrderTypeId) {
    const cachedWorkOrderTypes = getWorkOrderTypes();
    return cachedWorkOrderTypes.find((currentWorkOrderType) => currentWorkOrderType.workOrderTypeId === workOrderTypeId);
}
export function getWorkOrderTypes() {
    workOrderTypes ??= getWorkOrderTypesFromDatabase();
    return workOrderTypes;
}
function clearWorkOrderTypesCache() {
    workOrderTypes = undefined;
}
/*
 * Work Order Milestone Types
 */
let workOrderMilestoneTypes;
export function getWorkOrderMilestoneTypeById(workOrderMilestoneTypeId) {
    const cachedWorkOrderMilestoneTypes = getWorkOrderMilestoneTypes();
    return cachedWorkOrderMilestoneTypes.find((currentWorkOrderMilestoneType) => currentWorkOrderMilestoneType.workOrderMilestoneTypeId ===
        workOrderMilestoneTypeId);
}
export function getWorkOrderMilestoneTypeByWorkOrderMilestoneType(workOrderMilestoneTypeString) {
    const cachedWorkOrderMilestoneTypes = getWorkOrderMilestoneTypes();
    const workOrderMilestoneTypeLowerCase = workOrderMilestoneTypeString.toLowerCase();
    return cachedWorkOrderMilestoneTypes.find((currentWorkOrderMilestoneType) => currentWorkOrderMilestoneType.workOrderMilestoneType.toLowerCase() ===
        workOrderMilestoneTypeLowerCase);
}
export function getWorkOrderMilestoneTypes() {
    workOrderMilestoneTypes ??= getWorkOrderMilestoneTypesFromDatabase();
    return workOrderMilestoneTypes;
}
function clearWorkOrderMilestoneTypesCache() {
    workOrderMilestoneTypes = undefined;
}
/*
 * Cache Management
 */
export function preloadCaches() {
    debug('Preloading caches');
    getBurialSiteStatuses();
    getBurialSiteTypes();
    getContractTypes();
    getCommittalTypes();
    getIntermentContainerTypes();
    getWorkOrderTypes();
    getWorkOrderMilestoneTypes();
}
export const cacheTableNames = [
    'BurialSiteStatuses',
    'BurialSiteTypeFields',
    'BurialSiteTypes',
    'CommittalTypes',
    'ContractTypeFields',
    'ContractTypePrints',
    'ContractTypes',
    'FeeCategories',
    'Fees',
    'IntermentContainerTypes',
    'WorkOrderMilestoneTypes',
    'WorkOrderTypes'
];
export function clearCacheByTableName(tableName, relayMessage = true) {
    switch (tableName) {
        case 'BurialSiteStatuses': {
            clearBurialSiteStatusesCache();
            break;
        }
        case 'BurialSiteTypeFields':
        case 'BurialSiteTypes': {
            clearBurialSiteTypesCache();
            break;
        }
        case 'CommittalTypes': {
            clearCommittalTypesCache();
            break;
        }
        case 'ContractTypeFields':
        case 'ContractTypePrints':
        case 'ContractTypes': {
            clearContractTypesCache();
            break;
        }
        case 'IntermentContainerTypes': {
            clearIntermentContainerTypesCache();
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
export function clearCaches() {
    clearBurialSiteStatusesCache();
    clearBurialSiteTypesCache();
    clearContractTypesCache();
    clearCommittalTypesCache();
    clearIntermentContainerTypesCache();
    clearWorkOrderTypesCache();
    clearWorkOrderMilestoneTypesCache();
}
process.on('message', (message) => {
    if (message.messageType === 'clearCache' && message.pid !== process.pid) {
        debug(`Clearing cache: ${message.tableName}`);
        clearCacheByTableName(message.tableName, false);
    }
});

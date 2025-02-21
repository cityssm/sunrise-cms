// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/init-declarations */
import cluster from 'node:cluster';
import Debug from 'debug';
import getLotOccupantTypesFromDatabase from '../database/getLotOccupantTypes.js';
import getLotStatusesFromDatabase from '../database/getLotStatuses.js';
import getLotTypesFromDatabase from '../database/getLotTypes.js';
import getOccupancyTypeFieldsFromDatabase from '../database/getOccupancyTypeFields.js';
import getOccupancyTypesFromDatabase from '../database/getOccupancyTypes.js';
import getWorkOrderMilestoneTypesFromDatabase from '../database/getWorkOrderMilestoneTypes.js';
import getWorkOrderTypesFromDatabase from '../database/getWorkOrderTypes.js';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from './config.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:functions.cache:${process.pid}`);
/*
 * Lot Occupant Types
 */
let lotOccupantTypes;
export async function getLotOccupantTypes() {
    if (lotOccupantTypes === undefined) {
        lotOccupantTypes = await getLotOccupantTypesFromDatabase();
    }
    return lotOccupantTypes;
}
export async function getLotOccupantTypeById(lotOccupantTypeId) {
    const cachedLotOccupantTypes = await getLotOccupantTypes();
    return cachedLotOccupantTypes.find((currentLotOccupantType) => currentLotOccupantType.lotOccupantTypeId === lotOccupantTypeId);
}
export async function getLotOccupantTypeByLotOccupantType(lotOccupantType) {
    const cachedLotOccupantTypes = await getLotOccupantTypes();
    const lotOccupantTypeLowerCase = lotOccupantType.toLowerCase();
    return cachedLotOccupantTypes.find((currentLotOccupantType) => currentLotOccupantType.lotOccupantType.toLowerCase() ===
        lotOccupantTypeLowerCase);
}
function clearLotOccupantTypesCache() {
    lotOccupantTypes = undefined;
}
/*
 * Lot Statuses
 */
let lotStatuses;
export async function getLotStatuses() {
    if (lotStatuses === undefined) {
        lotStatuses = await getLotStatusesFromDatabase();
    }
    return lotStatuses;
}
export async function getLotStatusById(lotStatusId) {
    const cachedLotStatuses = await getLotStatuses();
    return cachedLotStatuses.find((currentLotStatus) => currentLotStatus.lotStatusId === lotStatusId);
}
export async function getLotStatusByLotStatus(lotStatus) {
    const cachedLotStatuses = await getLotStatuses();
    const lotStatusLowerCase = lotStatus.toLowerCase();
    return cachedLotStatuses.find((currentLotStatus) => currentLotStatus.lotStatus.toLowerCase() === lotStatusLowerCase);
}
function clearLotStatusesCache() {
    lotStatuses = undefined;
}
/*
 * Lot Types
 */
let lotTypes;
export async function getLotTypes() {
    if (lotTypes === undefined) {
        lotTypes = await getLotTypesFromDatabase();
    }
    return lotTypes;
}
export async function getLotTypeById(lotTypeId) {
    const cachedLotTypes = await getLotTypes();
    return cachedLotTypes.find((currentLotType) => currentLotType.lotTypeId === lotTypeId);
}
export async function getLotTypesByLotType(lotType) {
    const cachedLotTypes = await getLotTypes();
    const lotTypeLowerCase = lotType.toLowerCase();
    return cachedLotTypes.find((currentLotType) => currentLotType.lotType.toLowerCase() === lotTypeLowerCase);
}
function clearLotTypesCache() {
    lotTypes = undefined;
}
/*
 * Occupancy Types
 */
let occupancyTypes;
let allOccupancyTypeFields;
export async function getOccupancyTypes() {
    if (occupancyTypes === undefined) {
        occupancyTypes = await getOccupancyTypesFromDatabase();
    }
    return occupancyTypes;
}
export async function getAllOccupancyTypeFields() {
    if (allOccupancyTypeFields === undefined) {
        allOccupancyTypeFields = await getOccupancyTypeFieldsFromDatabase();
    }
    return allOccupancyTypeFields;
}
export async function getOccupancyTypeById(occupancyTypeId) {
    const cachedOccupancyTypes = await getOccupancyTypes();
    return cachedOccupancyTypes.find((currentOccupancyType) => currentOccupancyType.occupancyTypeId === occupancyTypeId);
}
export async function getOccupancyTypeByOccupancyType(occupancyTypeString) {
    const cachedOccupancyTypes = await getOccupancyTypes();
    const occupancyTypeLowerCase = occupancyTypeString.toLowerCase();
    return cachedOccupancyTypes.find((currentOccupancyType) => currentOccupancyType.occupancyType.toLowerCase() ===
        occupancyTypeLowerCase);
}
export async function getOccupancyTypePrintsById(occupancyTypeId) {
    const occupancyType = await getOccupancyTypeById(occupancyTypeId);
    if (occupancyType?.occupancyTypePrints === undefined ||
        occupancyType.occupancyTypePrints.length === 0) {
        return [];
    }
    if (occupancyType.occupancyTypePrints.includes('*')) {
        return getConfigProperty('settings.lotOccupancy.prints');
    }
    return occupancyType.occupancyTypePrints ?? [];
}
function clearOccupancyTypesCache() {
    occupancyTypes = undefined;
    allOccupancyTypeFields = undefined;
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
    await getLotOccupantTypes();
    await getLotStatuses();
    await getLotTypes();
    await getOccupancyTypes();
    await getWorkOrderTypes();
    await getWorkOrderMilestoneTypes();
}
export function clearCaches() {
    clearLotOccupantTypesCache();
    clearLotStatusesCache();
    clearLotTypesCache();
    clearOccupancyTypesCache();
    clearWorkOrderTypesCache();
    clearWorkOrderMilestoneTypesCache();
}
function clearWorkOrderMilestoneTypesCache() {
    workOrderMilestoneTypes = undefined;
}
export function clearCacheByTableName(tableName, relayMessage = true) {
    switch (tableName) {
        case 'LotOccupantTypes': {
            clearLotOccupantTypesCache();
            break;
        }
        case 'LotStatuses': {
            clearLotStatusesCache();
            break;
        }
        case 'LotTypes':
        case 'LotTypeFields': {
            clearLotTypesCache();
            break;
        }
        case 'OccupancyTypes':
        case 'OccupancyTypeFields':
        case 'OccupancyTypePrints': {
            clearOccupancyTypesCache();
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
    catch { }
}
process.on('message', (message) => {
    if (message.messageType === 'clearCache' && message.pid !== process.pid) {
        debug(`Clearing cache: ${message.tableName}`);
        clearCacheByTableName(message.tableName, false);
    }
});

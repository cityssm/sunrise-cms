import cluster from 'node:cluster';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { clearApiKeysCache, getCachedApiKeys } from './cache/apiKeys.cache.js';
import { clearBurialSiteStatusesCache, getCachedBurialSiteStatuses } from './cache/burialSiteStatuses.cache.js';
import { clearBurialSiteTypesCache, getCachedBurialSiteTypes } from './cache/burialSiteTypes.cache.js';
import { clearCommittalTypesCache, getCachedCommittalTypes } from './cache/committalTypes.cache.js';
import { clearContractTypesCache, getAllCachedContractTypeFields, getCachedContractTypes } from './cache/contractTypes.cache.js';
import { clearIntermentContainerTypesCache, getCachedIntermentContainerTypes } from './cache/intermentContainerTypes.cache.js';
import { clearSettingsCache, getCachedSettings } from './cache/settings.cache.js';
import { clearWorkOrderMilestoneTypesCache, getCachedWorkOrderMilestoneTypes } from './cache/workOrderMilestoneTypes.cache.js';
import { clearWorkOrderTypesCache, getCachedWorkOrderTypes } from './cache/workOrderTypes.cache.js';
const debug = Debug(`${DEBUG_NAMESPACE}:helpers.cache:${process.pid.toString().padEnd(5)}`);
/*
 * Cache Management
 */
export function preloadCaches() {
    debug('Preloading caches');
    getCachedBurialSiteStatuses();
    getCachedBurialSiteTypes();
    getCachedContractTypes();
    getCachedCommittalTypes();
    getCachedIntermentContainerTypes();
    getCachedWorkOrderTypes();
    getCachedWorkOrderMilestoneTypes();
    getCachedSettings();
    getAllCachedContractTypeFields();
    getCachedApiKeys();
    debug('Caches preloaded');
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
    'SunriseSettings',
    'WorkOrderMilestoneTypes',
    'WorkOrderTypes',
    'UserSettings'
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
        case 'SunriseSettings': {
            clearSettingsCache();
            break;
        }
        case 'UserSettings': {
            clearApiKeysCache();
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
            debug(`No cache clearing action for table: ${tableName}`);
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
    clearCommittalTypesCache();
    clearContractTypesCache();
    clearIntermentContainerTypesCache();
    clearSettingsCache();
    clearApiKeysCache();
    clearWorkOrderMilestoneTypesCache();
    clearWorkOrderTypesCache();
    debug('Caches cleared');
}
process.on('message', (message) => {
    if (message.messageType === 'clearCache' && message.pid !== process.pid) {
        debug(`Clearing cache: ${message.tableName}`);
        clearCacheByTableName(message.tableName, false);
    }
});

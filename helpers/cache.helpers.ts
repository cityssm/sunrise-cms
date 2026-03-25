import cluster from 'node:cluster'

import Debug from 'debug'

import { DEBUG_NAMESPACE, PROCESS_ID_MAX_DIGITS } from '../debug.config.js'
import type {
  ClearCacheWorkerMessage,
  WorkerMessage
} from '../types/application.types.js'

import { clearApiKeysCache, getCachedApiKeys } from './cache/apiKeys.cache.js'
import {
  clearBurialSiteStatusesCache,
  getCachedBurialSiteStatuses
} from './cache/burialSiteStatuses.cache.js'
import {
  clearBurialSiteTypesCache,
  getCachedBurialSiteTypes
} from './cache/burialSiteTypes.cache.js'
import {
  clearCemeteriesCache,
  getCachedCemeteries
} from './cache/cemeteries.cache.js'
import {
  clearCommittalTypesCache,
  getCachedCommittalTypes
} from './cache/committalTypes.cache.js'
import {
  clearContractTypesCache,
  getAllCachedContractTypeFields,
  getCachedContractTypes
} from './cache/contractTypes.cache.js'
import {
  clearIntermentContainerTypesCache,
  getCachedIntermentContainerTypes
} from './cache/intermentContainerTypes.cache.js'
import {
  clearIntermentDepthsCache,
  getCachedIntermentDepths
} from './cache/intermentDepths.cache.js'
import {
  clearServiceTypesCache,
  getCachedServiceTypes
} from './cache/serviceTypes.cache.js'
import {
  clearSettingsCache,
  getCachedSettings
} from './cache/settings.cache.js'
import {
  clearWorkOrderMilestoneTypesCache,
  getCachedWorkOrderMilestoneTypes
} from './cache/workOrderMilestoneTypes.cache.js'
import {
  clearWorkOrderTypesCache,
  getCachedWorkOrderTypes
} from './cache/workOrderTypes.cache.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:helpers.cache:${process.pid.toString().padEnd(PROCESS_ID_MAX_DIGITS)}`
)

/*
 * Cache Management
 */

export function preloadCaches(): void {
  debug('Preloading caches')
  getCachedBurialSiteStatuses()
  getCachedBurialSiteTypes()
  getCachedCemeteries()
  getCachedContractTypes()
  getCachedCommittalTypes()
  getCachedIntermentContainerTypes()
  getCachedIntermentDepths()
  getCachedServiceTypes()
  getCachedWorkOrderTypes()
  getCachedWorkOrderMilestoneTypes()
  getCachedSettings()
  getAllCachedContractTypeFields()
  getCachedApiKeys()
  debug('Caches preloaded')
}

export const cacheTableClearFunctions = {
  BurialSites: clearCemeteriesCache,
  BurialSiteStatuses: clearBurialSiteStatusesCache,
  BurialSiteTypeFields: clearBurialSiteTypesCache,
  BurialSiteTypes: clearBurialSiteTypesCache,
  Cemeteries: clearCemeteriesCache,
  CommittalTypes: clearCommittalTypesCache,
  ContractTypeFields: clearContractTypesCache,
  ContractTypePrints: clearContractTypesCache,
  ContractTypes: clearContractTypesCache,
  FeeCategories: clearSettingsCache,
  Fees: clearSettingsCache,
  IntermentContainerTypes: clearIntermentContainerTypesCache,
  IntermentDepths: clearIntermentDepthsCache,
  ServiceTypes: clearServiceTypesCache,
  SunriseSettings: clearSettingsCache,
  UserSettings: clearApiKeysCache,
  WorkOrderMilestoneTypes: clearWorkOrderMilestoneTypesCache,
  WorkOrderTypes: clearWorkOrderTypesCache
} satisfies Record<string, () => void>

export type CacheTableNames = keyof typeof cacheTableClearFunctions

export const cacheTableNames = Object.keys(
  cacheTableClearFunctions
) as CacheTableNames[]

export function clearCacheByTableName(
  tableName: CacheTableNames,
  relayMessage = true
): void {
  // eslint-disable-next-line security/detect-object-injection
  cacheTableClearFunctions[tableName]()

  try {
    if (relayMessage && cluster.isWorker) {
      const workerMessage: ClearCacheWorkerMessage = {
        messageType: 'clearCache',
        tableName,
        timeMillis: Date.now(),

        pid: process.pid
      }

      debug(`Sending clear cache from worker: ${tableName}`)

      if (process.send !== undefined) {
        process.send(workerMessage)
      }
    }
  } catch {
    // ignore
  }
}

export function clearCaches(): void {
  clearBurialSiteStatusesCache()
  clearBurialSiteTypesCache()
  clearCemeteriesCache()
  clearCommittalTypesCache()
  clearContractTypesCache()
  clearIntermentContainerTypesCache()
  clearIntermentDepthsCache()
  clearServiceTypesCache()
  clearSettingsCache()
  clearApiKeysCache()
  clearWorkOrderMilestoneTypesCache()
  clearWorkOrderTypesCache()

  debug('Caches cleared')
}

process.on('message', (message: WorkerMessage) => {
  if (message.messageType === 'clearCache' && message.pid !== process.pid) {
    debug(`Clearing cache: ${(message as ClearCacheWorkerMessage).tableName}`)
    clearCacheByTableName(
      (message as ClearCacheWorkerMessage).tableName as CacheTableNames,
      false
    )
  }
})

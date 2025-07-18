import cluster from 'node:cluster'

import Debug from 'debug'

import getBurialSiteStatusesFromDatabase from '../database/getBurialSiteStatuses.js'
import getBurialSiteTypesFromDatabase from '../database/getBurialSiteTypes.js'
import getCommittalTypesFromDatabase from '../database/getCommittalTypes.js'
import getContractTypeFieldsFromDatabase from '../database/getContractTypeFields.js'
import getContractTypesFromDatabase from '../database/getContractTypes.js'
import getIntermentContainerTypesFromDatabase from '../database/getIntermentContainerTypes.js'
import getSettingsFromDatabase from '../database/getSettings.js'
import getWorkOrderMilestoneTypesFromDatabase from '../database/getWorkOrderMilestoneTypes.js'
import getWorkOrderTypesFromDatabase from '../database/getWorkOrderTypes.js'
import { DEBUG_NAMESPACE } from '../debug.config.js'
import type {
  ClearCacheWorkerMessage,
  WorkerMessage
} from '../types/application.types.js'
import type {
  BurialSiteStatus,
  BurialSiteType,
  CommittalType,
  ContractType,
  ContractTypeField,
  IntermentContainerType,
  Setting,
  WorkOrderMilestoneType,
  WorkOrderType
} from '../types/record.types.js'
import type { SettingKey, SettingProperties } from '../types/setting.types.js'

import { getConfigProperty } from './config.helpers.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:helpers.cache:${process.pid.toString().padEnd(5)}`
)

/*
 * Burial Site Statuses
 */

let burialSiteStatuses: BurialSiteStatus[] | undefined

export function getBurialSiteStatusByBurialSiteStatus(
  burialSiteStatus: string,
  includeDeleted = false
): BurialSiteStatus | undefined {
  const cachedStatuses = getBurialSiteStatuses(includeDeleted)

  const statusLowerCase = burialSiteStatus.toLowerCase()

  return cachedStatuses.find(
    (currentStatus) =>
      currentStatus.burialSiteStatus.toLowerCase() === statusLowerCase
  )
}

export function getBurialSiteStatusById(
  burialSiteStatusId: number
): BurialSiteStatus | undefined {
  const cachedStatuses = getBurialSiteStatuses()

  return cachedStatuses.find(
    (currentStatus) => currentStatus.burialSiteStatusId === burialSiteStatusId
  )
}

export function getBurialSiteStatuses(
  includeDeleted = false
): BurialSiteStatus[] {
  burialSiteStatuses ??= getBurialSiteStatusesFromDatabase(includeDeleted)
  return burialSiteStatuses
}

function clearBurialSiteStatusesCache(): void {
  burialSiteStatuses = undefined
}

/*
 * Burial Site Types
 */

let burialSiteTypes: BurialSiteType[] | undefined

export function getBurialSiteTypeById(
  burialSiteTypeId: number
): BurialSiteType | undefined {
  const cachedTypes = getBurialSiteTypes()

  return cachedTypes.find(
    (currentType) => currentType.burialSiteTypeId === burialSiteTypeId
  )
}

export function getBurialSiteTypes(includeDeleted = false): BurialSiteType[] {
  burialSiteTypes ??= getBurialSiteTypesFromDatabase(includeDeleted)
  return burialSiteTypes
}

export function getBurialSiteTypesByBurialSiteType(
  burialSiteType: string,
  includeDeleted = false
): BurialSiteType | undefined {
  const cachedTypes = getBurialSiteTypes(includeDeleted)

  const typeLowerCase = burialSiteType.toLowerCase()

  return cachedTypes.find(
    (currentType) => currentType.burialSiteType.toLowerCase() === typeLowerCase
  )
}

function clearBurialSiteTypesCache(): void {
  burialSiteTypes = undefined
}

/*
 * Contract Types
 */

let contractTypes: ContractType[] | undefined
let allContractTypeFields: ContractTypeField[] | undefined

export function getAllContractTypeFields(): ContractTypeField[] {
  allContractTypeFields ??= getContractTypeFieldsFromDatabase()
  return allContractTypeFields
}

export function getContractTypeByContractType(
  contractTypeString: string,
  includeDeleted = false
): ContractType | undefined {
  const cachedTypes = getContractTypes(includeDeleted)

  const typeLowerCase = contractTypeString.toLowerCase()

  return cachedTypes.find(
    (currentType) => currentType.contractType.toLowerCase() === typeLowerCase
  )
}

export function getContractTypeById(
  contractTypeId: number
): ContractType | undefined {
  const cachedTypes = getContractTypes()

  return cachedTypes.find(
    (currentType) => currentType.contractTypeId === contractTypeId
  )
}

export function getContractTypePrintsById(contractTypeId: number): string[] {
  const contractType = getContractTypeById(contractTypeId)

  if (
    contractType?.contractTypePrints === undefined ||
    contractType.contractTypePrints.length === 0
  ) {
    return []
  }

  if (contractType.contractTypePrints.includes('*')) {
    return getConfigProperty('settings.contracts.prints')
  }

  return contractType.contractTypePrints ?? []
}

export function getContractTypes(includeDeleted = false): ContractType[] {
  contractTypes ??= getContractTypesFromDatabase(includeDeleted)
  return contractTypes
}

function clearContractTypesCache(): void {
  contractTypes = undefined
  allContractTypeFields = undefined
}

/*
 * Interment Container Types
 */

let intermentContainerTypes: IntermentContainerType[] | undefined

export function getIntermentContainerTypeById(
  intermentContainerTypeId: number
): IntermentContainerType | undefined {
  const cachedContainerTypes = getIntermentContainerTypes()

  return cachedContainerTypes.find(
    (currentContainerType) =>
      currentContainerType.intermentContainerTypeId === intermentContainerTypeId
  )
}

export function getIntermentContainerTypes(): IntermentContainerType[] {
  intermentContainerTypes ??= getIntermentContainerTypesFromDatabase()
  return intermentContainerTypes
}

function clearIntermentContainerTypesCache(): void {
  intermentContainerTypes = undefined
}

/*
 * Committal Types
 */

let committalTypes: CommittalType[] | undefined

export function getCommittalTypeById(
  committalTypeId: number
): CommittalType | undefined {
  const cachedCommittalTypes = getCommittalTypes()

  return cachedCommittalTypes.find(
    (currentCommittalType) =>
      currentCommittalType.committalTypeId === committalTypeId
  )
}

export function getCommittalTypes(): CommittalType[] {
  committalTypes ??= getCommittalTypesFromDatabase()
  return committalTypes
}

function clearCommittalTypesCache(): void {
  committalTypes = undefined
}

/*
 * Work Order Types
 */

let workOrderTypes: WorkOrderType[] | undefined

export function getWorkOrderTypeById(
  workOrderTypeId: number
): WorkOrderType | undefined {
  const cachedWorkOrderTypes = getWorkOrderTypes()

  return cachedWorkOrderTypes.find(
    (currentWorkOrderType) =>
      currentWorkOrderType.workOrderTypeId === workOrderTypeId
  )
}

export function getWorkOrderTypes(): WorkOrderType[] {
  workOrderTypes ??= getWorkOrderTypesFromDatabase()
  return workOrderTypes
}

function clearWorkOrderTypesCache(): void {
  workOrderTypes = undefined
}

/*
 * Work Order Milestone Types
 */

let workOrderMilestoneTypes: WorkOrderMilestoneType[] | undefined

export function getWorkOrderMilestoneTypeById(
  workOrderMilestoneTypeId: number
): WorkOrderMilestoneType | undefined {
  const cachedWorkOrderMilestoneTypes = getWorkOrderMilestoneTypes()

  return cachedWorkOrderMilestoneTypes.find(
    (currentWorkOrderMilestoneType) =>
      currentWorkOrderMilestoneType.workOrderMilestoneTypeId ===
      workOrderMilestoneTypeId
  )
}

export function getWorkOrderMilestoneTypeByWorkOrderMilestoneType(
  workOrderMilestoneTypeString: string,
  includeDeleted = false
): WorkOrderMilestoneType | undefined {
  const cachedWorkOrderMilestoneTypes =
    getWorkOrderMilestoneTypes(includeDeleted)

  const workOrderMilestoneTypeLowerCase =
    workOrderMilestoneTypeString.toLowerCase()

  return cachedWorkOrderMilestoneTypes.find(
    (currentWorkOrderMilestoneType) =>
      currentWorkOrderMilestoneType.workOrderMilestoneType.toLowerCase() ===
      workOrderMilestoneTypeLowerCase
  )
}

export function getWorkOrderMilestoneTypes(
  includeDeleted = false
): WorkOrderMilestoneType[] {
  workOrderMilestoneTypes ??=
    getWorkOrderMilestoneTypesFromDatabase(includeDeleted)
  return workOrderMilestoneTypes
}

function clearWorkOrderMilestoneTypesCache(): void {
  workOrderMilestoneTypes = undefined
}

/*
 * Settings
 */

let settings: Array<Partial<Setting> & SettingProperties> | undefined

export function getSettings(): Array<Partial<Setting> & SettingProperties> {
  settings ??= getSettingsFromDatabase()
  return settings
}

export function getSetting(
  settingKey: SettingKey
): Partial<Setting> & SettingProperties {
  const cachedSettings = getSettings()
  return cachedSettings.find(
    (setting) => setting.settingKey === settingKey
  ) as Partial<Setting> & SettingProperties
}

export function getSettingValue(settingKey: SettingKey): string {
  const setting = getSetting(settingKey)

  let settingValue = setting.settingValue ?? ''

  if (settingValue === '') {
    settingValue = setting.defaultValue
  }

  return settingValue
}

export function clearSettingsCache(): void {
  settings = undefined
}

/*
 * Cache Management
 */

export function preloadCaches(): void {
  debug('Preloading caches')
  getBurialSiteStatuses()
  getBurialSiteTypes()
  getContractTypes()
  getCommittalTypes()
  getIntermentContainerTypes()
  getWorkOrderTypes()
  getWorkOrderMilestoneTypes()
  getSettings()
  getAllContractTypeFields()
  debug('Caches preloaded')
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
  'WorkOrderTypes'
] as const

export type CacheTableNames = (typeof cacheTableNames)[number]

export function clearCacheByTableName(
  tableName: CacheTableNames,
  relayMessage = true
): void {
  switch (tableName) {
    case 'BurialSiteStatuses': {
      clearBurialSiteStatusesCache()
      break
    }

    case 'BurialSiteTypeFields':
    case 'BurialSiteTypes': {
      clearBurialSiteTypesCache()
      break
    }

    case 'CommittalTypes': {
      clearCommittalTypesCache()
      break
    }

    case 'ContractTypeFields':
    case 'ContractTypePrints':
    case 'ContractTypes': {
      clearContractTypesCache()
      break
    }

    case 'IntermentContainerTypes': {
      clearIntermentContainerTypesCache()
      break
    }

    case 'SunriseSettings': {
      clearSettingsCache()
      break
    }

    case 'WorkOrderMilestoneTypes': {
      clearWorkOrderMilestoneTypesCache()
      break
    }

    case 'WorkOrderTypes': {
      clearWorkOrderTypesCache()
      break
    }

    default: {
      return
    }
  }

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
  clearContractTypesCache()
  clearCommittalTypesCache()
  clearIntermentContainerTypesCache()
  clearWorkOrderTypesCache()
  clearWorkOrderMilestoneTypesCache()
  clearSettingsCache()
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

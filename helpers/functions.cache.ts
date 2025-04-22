// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable perfectionist/sort-modules */

import cluster from 'node:cluster'

import Debug from 'debug'

import getBurialSiteStatusesFromDatabase from '../database/getBurialSiteStatuses.js'
import getBurialSiteTypesFromDatabase from '../database/getBurialSiteTypes.js'
import getCommittalTypesFromDatabase from '../database/getCommittalTypes.js'
import getContractTypeFieldsFromDatabase from '../database/getContractTypeFields.js'
import getContractTypesFromDatabase from '../database/getContractTypes.js'
import getIntermentContainerTypesFromDatabase from '../database/getIntermentContainerTypes.js'
import getWorkOrderMilestoneTypesFromDatabase from '../database/getWorkOrderMilestoneTypes.js'
import getWorkOrderTypesFromDatabase from '../database/getWorkOrderTypes.js'
import { DEBUG_NAMESPACE } from '../debug.config.js'
import type {
  ClearCacheWorkerMessage,
  WorkerMessage
} from '../types/applicationTypes.js'
import type {
  BurialSiteStatus,
  BurialSiteType,
  CommittalType,
  ContractType,
  ContractTypeField,
  IntermentContainerType,
  WorkOrderMilestoneType,
  WorkOrderType
} from '../types/recordTypes.js'

import { getConfigProperty } from './config.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:functions.cache:${process.pid}`)

/*
 * Burial Site Statuses
 */

let burialSiteStatuses: BurialSiteStatus[] | undefined

export async function getBurialSiteStatusByBurialSiteStatus(
  burialSiteStatus: string
): Promise<BurialSiteStatus | undefined> {
  const cachedStatuses = await getBurialSiteStatuses()

  const statusLowerCase = burialSiteStatus.toLowerCase()

  return cachedStatuses.find(
    (currentStatus) =>
      currentStatus.burialSiteStatus.toLowerCase() === statusLowerCase
  )
}

export async function getBurialSiteStatusById(
  burialSiteStatusId: number
): Promise<BurialSiteStatus | undefined> {
  const cachedStatuses = await getBurialSiteStatuses()

  return cachedStatuses.find(
    (currentStatus) => currentStatus.burialSiteStatusId === burialSiteStatusId
  )
}

export async function getBurialSiteStatuses(): Promise<BurialSiteStatus[]> {
  burialSiteStatuses ??= await getBurialSiteStatusesFromDatabase()
  return burialSiteStatuses
}

function clearBurialSiteStatusesCache(): void {
  burialSiteStatuses = undefined
}

/*
 * Burial Site Types
 */

let burialSiteTypes: BurialSiteType[] | undefined

export async function getBurialSiteTypeById(
  burialSiteTypeId: number
): Promise<BurialSiteType | undefined> {
  const cachedTypes = await getBurialSiteTypes()

  return cachedTypes.find(
    (currentType) => currentType.burialSiteTypeId === burialSiteTypeId
  )
}

export async function getBurialSiteTypes(): Promise<BurialSiteType[]> {
  burialSiteTypes ??= await getBurialSiteTypesFromDatabase()
  return burialSiteTypes
}

export async function getBurialSiteTypesByBurialSiteType(
  burialSiteType: string
): Promise<BurialSiteType | undefined> {
  const cachedTypes = await getBurialSiteTypes()

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

export async function getAllContractTypeFields(): Promise<ContractTypeField[]> {
  allContractTypeFields ??= await getContractTypeFieldsFromDatabase()
  return allContractTypeFields
}

export async function getContractTypeByContractType(
  contractTypeString: string
): Promise<ContractType | undefined> {
  const cachedTypes = await getContractTypes()

  const typeLowerCase = contractTypeString.toLowerCase()

  return cachedTypes.find(
    (currentType) => currentType.contractType.toLowerCase() === typeLowerCase
  )
}

export async function getContractTypeById(
  contractTypeId: number
): Promise<ContractType | undefined> {
  const cachedTypes = await getContractTypes()

  return cachedTypes.find(
    (currentType) => currentType.contractTypeId === contractTypeId
  )
}

export async function getContractTypePrintsById(
  contractTypeId: number
): Promise<string[]> {
  const contractType = await getContractTypeById(contractTypeId)

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

export async function getContractTypes(): Promise<ContractType[]> {
  contractTypes ??= await getContractTypesFromDatabase()
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

export async function getIntermentContainerTypeById(
  intermentContainerTypeId: number
): Promise<IntermentContainerType | undefined> {
  const cachedContainerTypes = await getIntermentContainerTypes()

  return cachedContainerTypes.find(
    (currentContainerType) =>
      currentContainerType.intermentContainerTypeId === intermentContainerTypeId
  )
}

export async function getIntermentContainerTypes(): Promise<
  IntermentContainerType[]
> {
  intermentContainerTypes ??= await getIntermentContainerTypesFromDatabase()
  return intermentContainerTypes
}

function clearIntermentContainerTypesCache(): void {
  intermentContainerTypes = undefined
}

/*
 * Committal Types
 */

let committalTypes: CommittalType[] | undefined

export async function getCommittalTypeById(
  committalTypeId: number
): Promise<CommittalType | undefined> {
  const cachedCommittalTypes = await getCommittalTypes()

  return cachedCommittalTypes.find(
    (currentCommittalType) =>
      currentCommittalType.committalTypeId === committalTypeId
  )
}

export async function getCommittalTypes(): Promise<CommittalType[]> {
  committalTypes ??= await getCommittalTypesFromDatabase()
  return committalTypes
}

function clearCommittalTypesCache(): void {
  committalTypes = undefined
}

/*
 * Work Order Types
 */

let workOrderTypes: WorkOrderType[] | undefined

export async function getWorkOrderTypeById(
  workOrderTypeId: number
): Promise<WorkOrderType | undefined> {
  const cachedWorkOrderTypes = await getWorkOrderTypes()

  return cachedWorkOrderTypes.find(
    (currentWorkOrderType) =>
      currentWorkOrderType.workOrderTypeId === workOrderTypeId
  )
}

export async function getWorkOrderTypes(): Promise<WorkOrderType[]> {
  workOrderTypes ??= await getWorkOrderTypesFromDatabase()
  return workOrderTypes
}

function clearWorkOrderTypesCache(): void {
  workOrderTypes = undefined
}

/*
 * Work Order Milestone Types
 */

let workOrderMilestoneTypes: WorkOrderMilestoneType[] | undefined

export async function getWorkOrderMilestoneTypeById(
  workOrderMilestoneTypeId: number
): Promise<WorkOrderMilestoneType | undefined> {
  const cachedWorkOrderMilestoneTypes = await getWorkOrderMilestoneTypes()

  return cachedWorkOrderMilestoneTypes.find(
    (currentWorkOrderMilestoneType) =>
      currentWorkOrderMilestoneType.workOrderMilestoneTypeId ===
      workOrderMilestoneTypeId
  )
}

export async function getWorkOrderMilestoneTypeByWorkOrderMilestoneType(
  workOrderMilestoneTypeString: string
): Promise<WorkOrderMilestoneType | undefined> {
  const cachedWorkOrderMilestoneTypes = await getWorkOrderMilestoneTypes()

  const workOrderMilestoneTypeLowerCase =
    workOrderMilestoneTypeString.toLowerCase()

  return cachedWorkOrderMilestoneTypes.find(
    (currentWorkOrderMilestoneType) =>
      currentWorkOrderMilestoneType.workOrderMilestoneType.toLowerCase() ===
      workOrderMilestoneTypeLowerCase
  )
}

export async function getWorkOrderMilestoneTypes(): Promise<
  WorkOrderMilestoneType[]
> {
  workOrderMilestoneTypes ??= await getWorkOrderMilestoneTypesFromDatabase()
  return workOrderMilestoneTypes
}


function clearWorkOrderMilestoneTypesCache(): void {
  workOrderMilestoneTypes = undefined
}

/*
 * Cache Management
 */

export async function preloadCaches(): Promise<void> {
  debug('Preloading caches')
  await getBurialSiteStatuses()
  await getBurialSiteTypes()
  await getContractTypes()
  await getCommittalTypes()
  await getIntermentContainerTypes()
  await getWorkOrderTypes()
  await getWorkOrderMilestoneTypes()
}

type CacheTableNames =
  | 'BurialSiteStatuses'
  | 'BurialSiteTypeFields'
  | 'BurialSiteTypes'
  | 'CommittalTypes'
  | 'ContractTypeFields'
  | 'ContractTypePrints'
  | 'ContractTypes'
  | 'FeeCategories'
  | 'Fees'
  | 'IntermentContainerTypes'
  | 'WorkOrderMilestoneTypes'
  | 'WorkOrderTypes'

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

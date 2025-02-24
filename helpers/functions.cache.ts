// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/init-declarations */

import cluster from 'node:cluster'

import Debug from 'debug'

import getBurialSiteStatusesFromDatabase from '../database/getBurialSiteStatuses.js'
import getBurialSiteTypesFromDatabase from '../database/getBurialSiteTypes.js'
import getContractTypeFieldsFromDatabase from '../database/getContractTypeFields.js'
import getContractTypesFromDatabase from '../database/getContractTypes.js'
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
  ContractType,
  ContractTypeField,
  WorkOrderMilestoneType,
  WorkOrderType
} from '../types/recordTypes.js'

import { getConfigProperty } from './config.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:functions.cache:${process.pid}`)

/*
 * Burial Site Statuses
 */

let burialSiteStatuses: BurialSiteStatus[] | undefined

export async function getBurialSiteStatuses(): Promise<BurialSiteStatus[]> {
  if (burialSiteStatuses === undefined) {
    burialSiteStatuses = await getBurialSiteStatusesFromDatabase()
  }

  return burialSiteStatuses
}

export async function getBurialSiteStatusById(
  burialSiteStatusId: number
): Promise<BurialSiteStatus | undefined> {
  const cachedStatuses = await getBurialSiteStatuses()

  return cachedStatuses.find(
    (currentStatus) => currentStatus.burialSiteStatusId === burialSiteStatusId
  )
}

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

function clearBurialSiteStatusesCache(): void {
  burialSiteStatuses = undefined
}

/*
 * Burial Site Types
 */

let burialSiteTypes: BurialSiteType[] | undefined

export async function getBurialSiteTypes(): Promise<BurialSiteType[]> {
  if (burialSiteTypes === undefined) {
    burialSiteTypes = await getBurialSiteTypesFromDatabase()
  }

  return burialSiteTypes
}

export async function getBurialSiteTypeById(
  burialSiteTypeId: number
): Promise<BurialSiteType | undefined> {
  const cachedTypes = await getBurialSiteTypes()

  return cachedTypes.find(
    (currentType) => currentType.burialSiteTypeId === burialSiteTypeId
  )
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

export async function getContractTypes(): Promise<ContractType[]> {
  if (contractTypes === undefined) {
    contractTypes = await getContractTypesFromDatabase()
  }

  return contractTypes
}

export async function getAllContractTypeFields(): Promise<ContractTypeField[]> {
  if (allContractTypeFields === undefined) {
    allContractTypeFields = await getContractTypeFieldsFromDatabase()
  }
  return allContractTypeFields
}

export async function getContractTypeById(
  contractTypeId: number
): Promise<ContractType | undefined> {
  const cachedTypes = await getContractTypes()

  return cachedTypes.find(
    (currentType) => currentType.contractTypeId === contractTypeId
  )
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

function clearContractTypesCache(): void {
  contractTypes = undefined
  allContractTypeFields = undefined
}

/*
 * Work Order Types
 */

let workOrderTypes: WorkOrderType[] | undefined

export async function getWorkOrderTypes(): Promise<WorkOrderType[]> {
  if (workOrderTypes === undefined) {
    workOrderTypes = await getWorkOrderTypesFromDatabase()
  }

  return workOrderTypes
}

export async function getWorkOrderTypeById(
  workOrderTypeId: number
): Promise<WorkOrderType | undefined> {
  const cachedWorkOrderTypes = await getWorkOrderTypes()

  return cachedWorkOrderTypes.find(
    (currentWorkOrderType) =>
      currentWorkOrderType.workOrderTypeId === workOrderTypeId
  )
}

function clearWorkOrderTypesCache(): void {
  workOrderTypes = undefined
}

/*
 * Work Order Milestone Types
 */

let workOrderMilestoneTypes: WorkOrderMilestoneType[] | undefined

export async function getWorkOrderMilestoneTypes(): Promise<
  WorkOrderMilestoneType[]
> {
  if (workOrderMilestoneTypes === undefined) {
    workOrderMilestoneTypes = await getWorkOrderMilestoneTypesFromDatabase()
  }

  return workOrderMilestoneTypes
}

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

export async function preloadCaches(): Promise<void> {
  debug('Preloading caches')
  await getBurialSiteStatuses()
  await getBurialSiteTypes()
  await getContractTypes()
  await getWorkOrderTypes()
  await getWorkOrderMilestoneTypes()
}

export function clearCaches(): void {
  clearBurialSiteStatusesCache()
  clearBurialSiteTypesCache()
  clearContractTypesCache()
  clearWorkOrderTypesCache()
  clearWorkOrderMilestoneTypesCache()
}

function clearWorkOrderMilestoneTypesCache(): void {
  workOrderMilestoneTypes = undefined
}

export function clearCacheByTableName(
  tableName: string,
  relayMessage = true
): void {
  switch (tableName) {
    case 'BurialSiteStatuses': {
      clearBurialSiteStatusesCache()
      break
    }

    case 'BurialSiteTypes':
    case 'BurialSiteTypeFields': {
      clearBurialSiteTypesCache()
      break
    }

    case 'ContractTypes':
    case 'ContractTypeFields':
    case 'ContractTypePrints': {
      clearContractTypesCache()
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
  } catch {}
}

process.on('message', (message: WorkerMessage) => {
  if (message.messageType === 'clearCache' && message.pid !== process.pid) {
    debug(`Clearing cache: ${(message as ClearCacheWorkerMessage).tableName}`)
    clearCacheByTableName((message as ClearCacheWorkerMessage).tableName, false)
  }
})

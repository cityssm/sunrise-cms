// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/init-declarations */

import cluster from 'node:cluster'

import Debug from 'debug'

import getLotOccupantTypesFromDatabase from '../database/getLotOccupantTypes.js'
import getLotStatusesFromDatabase from '../database/getLotStatuses.js'
import getLotTypesFromDatabase from '../database/getLotTypes.js'
import getOccupancyTypeFieldsFromDatabase from '../database/getOccupancyTypeFields.js'
import getOccupancyTypesFromDatabase from '../database/getOccupancyTypes.js'
import getWorkOrderMilestoneTypesFromDatabase from '../database/getWorkOrderMilestoneTypes.js'
import getWorkOrderTypesFromDatabase from '../database/getWorkOrderTypes.js'
import { DEBUG_NAMESPACE } from '../debug.config.js'
import type {
  ClearCacheWorkerMessage,
  WorkerMessage
} from '../types/applicationTypes.js'
import type {
  LotOccupantType,
  LotStatus,
  LotType,
  OccupancyType,
  OccupancyTypeField,
  WorkOrderMilestoneType,
  WorkOrderType
} from '../types/recordTypes.js'

import { getConfigProperty } from './config.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:functions.cache:${process.pid}`)

/*
 * Lot Occupant Types
 */

let lotOccupantTypes: LotOccupantType[] | undefined

export async function getLotOccupantTypes(): Promise<LotOccupantType[]> {
  if (lotOccupantTypes === undefined) {
    lotOccupantTypes = await getLotOccupantTypesFromDatabase()
  }

  return lotOccupantTypes
}

export async function getLotOccupantTypeById(
  lotOccupantTypeId: number
): Promise<LotOccupantType | undefined> {
  const cachedLotOccupantTypes = await getLotOccupantTypes()

  return cachedLotOccupantTypes.find(
    (currentLotOccupantType) =>
      currentLotOccupantType.lotOccupantTypeId === lotOccupantTypeId
  )
}

export async function getLotOccupantTypeByLotOccupantType(
  lotOccupantType: string
): Promise<LotOccupantType | undefined> {
  const cachedLotOccupantTypes = await getLotOccupantTypes()

  const lotOccupantTypeLowerCase = lotOccupantType.toLowerCase()

  return cachedLotOccupantTypes.find(
    (currentLotOccupantType) =>
      currentLotOccupantType.lotOccupantType.toLowerCase() ===
      lotOccupantTypeLowerCase
  )
}

function clearLotOccupantTypesCache(): void {
  lotOccupantTypes = undefined
}

/*
 * Lot Statuses
 */

let lotStatuses: LotStatus[] | undefined

export async function getLotStatuses(): Promise<LotStatus[]> {
  if (lotStatuses === undefined) {
    lotStatuses = await getLotStatusesFromDatabase()
  }

  return lotStatuses
}

export async function getLotStatusById(
  lotStatusId: number
): Promise<LotStatus | undefined> {
  const cachedLotStatuses = await getLotStatuses()

  return cachedLotStatuses.find(
    (currentLotStatus) => currentLotStatus.lotStatusId === lotStatusId
  )
}

export async function getLotStatusByLotStatus(
  lotStatus: string
): Promise<LotStatus | undefined> {
  const cachedLotStatuses = await getLotStatuses()

  const lotStatusLowerCase = lotStatus.toLowerCase()

  return cachedLotStatuses.find(
    (currentLotStatus) =>
      currentLotStatus.lotStatus.toLowerCase() === lotStatusLowerCase
  )
}

function clearLotStatusesCache(): void {
  lotStatuses = undefined
}

/*
 * Lot Types
 */

let lotTypes: LotType[] | undefined

export async function getLotTypes(): Promise<LotType[]> {
  if (lotTypes === undefined) {
    lotTypes = await getLotTypesFromDatabase()
  }

  return lotTypes
}

export async function getLotTypeById(
  lotTypeId: number
): Promise<LotType | undefined> {
  const cachedLotTypes = await getLotTypes()

  return cachedLotTypes.find(
    (currentLotType) => currentLotType.lotTypeId === lotTypeId
  )
}

export async function getLotTypesByLotType(
  lotType: string
): Promise<LotType | undefined> {
  const cachedLotTypes = await getLotTypes()

  const lotTypeLowerCase = lotType.toLowerCase()

  return cachedLotTypes.find(
    (currentLotType) =>
      currentLotType.lotType.toLowerCase() === lotTypeLowerCase
  )
}

function clearLotTypesCache(): void {
  lotTypes = undefined
}

/*
 * Occupancy Types
 */

let occupancyTypes: OccupancyType[] | undefined
let allOccupancyTypeFields: OccupancyTypeField[] | undefined

export async function getOccupancyTypes(): Promise<OccupancyType[]> {
  if (occupancyTypes === undefined) {
    occupancyTypes = await getOccupancyTypesFromDatabase()
  }

  return occupancyTypes
}

export async function getAllOccupancyTypeFields(): Promise<
  OccupancyTypeField[]
> {
  if (allOccupancyTypeFields === undefined) {
    allOccupancyTypeFields = await getOccupancyTypeFieldsFromDatabase()
  }
  return allOccupancyTypeFields
}

export async function getOccupancyTypeById(
  occupancyTypeId: number
): Promise<OccupancyType | undefined> {
  const cachedOccupancyTypes = await getOccupancyTypes()

  return cachedOccupancyTypes.find(
    (currentOccupancyType) =>
      currentOccupancyType.occupancyTypeId === occupancyTypeId
  )
}

export async function getOccupancyTypeByOccupancyType(
  occupancyTypeString: string
): Promise<OccupancyType | undefined> {
  const cachedOccupancyTypes = await getOccupancyTypes()

  const occupancyTypeLowerCase = occupancyTypeString.toLowerCase()

  return cachedOccupancyTypes.find(
    (currentOccupancyType) =>
      currentOccupancyType.occupancyType.toLowerCase() ===
      occupancyTypeLowerCase
  )
}

export async function getOccupancyTypePrintsById(
  occupancyTypeId: number
): Promise<string[]> {
  const occupancyType = await getOccupancyTypeById(occupancyTypeId)

  if (
    occupancyType?.occupancyTypePrints === undefined ||
    occupancyType.occupancyTypePrints.length === 0
  ) {
    return []
  }

  if (occupancyType.occupancyTypePrints.includes('*')) {
    return getConfigProperty('settings.lotOccupancy.prints')
  }

  return occupancyType.occupancyTypePrints ?? []
}

function clearOccupancyTypesCache(): void {
  occupancyTypes = undefined
  allOccupancyTypeFields = undefined
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
  await getLotOccupantTypes()
  await getLotStatuses()
  await getLotTypes()
  await getOccupancyTypes()
  await getWorkOrderTypes()
  await getWorkOrderMilestoneTypes()
}

export function clearCaches(): void {
  clearLotOccupantTypesCache()
  clearLotStatusesCache()
  clearLotTypesCache()
  clearOccupancyTypesCache()
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
    case 'LotOccupantTypes': {
      clearLotOccupantTypesCache()
      break
    }

    case 'LotStatuses': {
      clearLotStatusesCache()
      break
    }

    case 'LotTypes':
    case 'LotTypeFields': {
      clearLotTypesCache()
      break
    }

    case 'OccupancyTypes':
    case 'OccupancyTypeFields':
    case 'OccupancyTypePrints': {
      clearOccupancyTypesCache()
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

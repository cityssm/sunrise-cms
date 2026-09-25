import getWorkOrderTypesFromDatabase from '../../database/getWorkOrderTypes.js'
import type { WorkOrderType } from '../../types/record.types.js'

const cache: {
  workOrderTypes: WorkOrderType[] | undefined
} = {
  workOrderTypes: undefined
}

export function getCachedWorkOrderTypeById(
  workOrderTypeId: number
): WorkOrderType | undefined {
  const cachedWorkOrderTypes = getCachedWorkOrderTypes()

  return cachedWorkOrderTypes.find(
    (currentWorkOrderType) =>
      currentWorkOrderType.workOrderTypeId === workOrderTypeId
  )
}

export function getCachedWorkOrderTypeByWorkOrderType(
  workOrderTypeString: string
): WorkOrderType | undefined {
  const cachedWorkOrderTypes = getCachedWorkOrderTypes()

  const workOrderTypeLowerCase = workOrderTypeString.toLowerCase()

  return cachedWorkOrderTypes.find(
    (currentWorkOrderType) =>
      currentWorkOrderType.workOrderType.toLowerCase() ===
      workOrderTypeLowerCase
  )
}

export function getCachedWorkOrderTypes(): WorkOrderType[] {
  cache.workOrderTypes ??= getWorkOrderTypesFromDatabase()
  return cache.workOrderTypes
}

export function clearWorkOrderTypesCache(): void {
  cache.workOrderTypes = undefined
}

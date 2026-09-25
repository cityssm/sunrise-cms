import getWorkOrderMilestoneTypesFromDatabase from '../../database/getWorkOrderMilestoneTypes.js'
import type { WorkOrderMilestoneType } from '../../types/record.types.js'

const cache: {
  workOrderMilestoneTypes: WorkOrderMilestoneType[] | undefined
} = {
  workOrderMilestoneTypes: undefined
}

export function getCachedWorkOrderMilestoneTypeById(
  workOrderMilestoneTypeId: number
): WorkOrderMilestoneType | undefined {
  const cachedWorkOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes()

  return cachedWorkOrderMilestoneTypes.find(
    (currentWorkOrderMilestoneType) =>
      currentWorkOrderMilestoneType.workOrderMilestoneTypeId ===
      workOrderMilestoneTypeId
  )
}

export function getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType(
  workOrderMilestoneTypeString: string,
  includeDeleted = false
): WorkOrderMilestoneType | undefined {
  const cachedWorkOrderMilestoneTypes =
    getCachedWorkOrderMilestoneTypes(includeDeleted)

  const workOrderMilestoneTypeLowerCase =
    workOrderMilestoneTypeString.toLowerCase()

  return cachedWorkOrderMilestoneTypes.find(
    (currentWorkOrderMilestoneType) =>
      currentWorkOrderMilestoneType.workOrderMilestoneType.toLowerCase() ===
      workOrderMilestoneTypeLowerCase
  )
}

export function getCachedWorkOrderMilestoneTypes(
  includeDeleted = false
): WorkOrderMilestoneType[] {
  if (includeDeleted) {
    return getWorkOrderMilestoneTypesFromDatabase(includeDeleted)
  }

  cache.workOrderMilestoneTypes ??=
    getWorkOrderMilestoneTypesFromDatabase(includeDeleted)

  return cache.workOrderMilestoneTypes
}

export function clearWorkOrderMilestoneTypesCache(): void {
  cache.workOrderMilestoneTypes = undefined
}

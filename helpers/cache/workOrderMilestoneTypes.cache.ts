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
  shouldIncludeDeletedRecords = false
): WorkOrderMilestoneType | undefined {
  const cachedWorkOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes(
    shouldIncludeDeletedRecords
  )

  const workOrderMilestoneTypeLowerCase =
    workOrderMilestoneTypeString.toLowerCase()

  return cachedWorkOrderMilestoneTypes.find(
    (currentWorkOrderMilestoneType) =>
      currentWorkOrderMilestoneType.workOrderMilestoneType.toLowerCase() ===
      workOrderMilestoneTypeLowerCase
  )
}

export function getCachedWorkOrderMilestoneTypes(
  shouldIncludeDeletedRecords = false
): WorkOrderMilestoneType[] {
  if (shouldIncludeDeletedRecords) {
    return getWorkOrderMilestoneTypesFromDatabase(shouldIncludeDeletedRecords)
  }

  cache.workOrderMilestoneTypes ??= getWorkOrderMilestoneTypesFromDatabase(
    shouldIncludeDeletedRecords
  )

  return cache.workOrderMilestoneTypes
}

export function clearWorkOrderMilestoneTypesCache(): void {
  cache.workOrderMilestoneTypes = undefined
}

import getWorkOrderMilestoneTypesFromDatabase from '../../database/getWorkOrderMilestoneTypes.js'
import type { WorkOrderMilestoneType } from '../../types/record.types.js'

let workOrderMilestoneTypes: WorkOrderMilestoneType[] | undefined

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
  workOrderMilestoneTypes ??=
    getWorkOrderMilestoneTypesFromDatabase(includeDeleted)
  return workOrderMilestoneTypes
}

export function clearWorkOrderMilestoneTypesCache(): void {
  workOrderMilestoneTypes = undefined
}

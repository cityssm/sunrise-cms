import getWorkOrderTypesFromDatabase from '../../database/getWorkOrderTypes.js'
import type { WorkOrderType } from '../../types/record.types.js'

let workOrderTypes: WorkOrderType[] | undefined

export function getCachedWorkOrderTypeById(
  workOrderTypeId: number
): WorkOrderType | undefined {
  const cachedWorkOrderTypes = getCachedWorkOrderTypes()

  return cachedWorkOrderTypes.find(
    (currentWorkOrderType) =>
      currentWorkOrderType.workOrderTypeId === workOrderTypeId
  )
}

export function getCachedWorkOrderTypes(): WorkOrderType[] {
  workOrderTypes ??= getWorkOrderTypesFromDatabase()
  return workOrderTypes
}

export function clearWorkOrderTypesCache(): void {
  workOrderTypes = undefined
}

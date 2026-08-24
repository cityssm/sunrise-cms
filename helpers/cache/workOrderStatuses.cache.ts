import getWorkOrderStatusesFromDatabase from '../../database/getWorkOrderStatuses.js'
import type { WorkOrderStatus } from '../../types/record.types.js'

let workOrderStatuses: WorkOrderStatus[] | undefined

export function getCachedWorkOrderStatusById(
  workOrderStatusId: number
): WorkOrderStatus | undefined {
  const cachedWorkOrderStatuses = getCachedWorkOrderStatuses()

  return cachedWorkOrderStatuses.find(
    (currentWorkOrderStatus) =>
      currentWorkOrderStatus.workOrderStatusId === workOrderStatusId
  )
}

export function getCachedWorkOrderStatuses(): WorkOrderStatus[] {
  workOrderStatuses ??= getWorkOrderStatusesFromDatabase()
  return workOrderStatuses
}

export function clearWorkOrderStatusesCache(): void {
  workOrderStatuses = undefined
}

export function getCachedWorkOrderStatusByWorkOrderStatus(
  workOrderStatusString: string
): WorkOrderStatus | undefined {
  const cachedWorkOrderStatuses = getCachedWorkOrderStatuses()

  const workOrderStatusLowerCase = workOrderStatusString.toLowerCase()

  return cachedWorkOrderStatuses.find(
    (currentWorkOrderStatus) =>
      currentWorkOrderStatus.workOrderStatus.toLowerCase() ===
      workOrderStatusLowerCase
  )
}

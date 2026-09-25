import getWorkOrderStatusesFromDatabase from '../../database/getWorkOrderStatuses.js'
import type { WorkOrderStatus } from '../../types/record.types.js'

const cache: {
  workOrderStatuses: WorkOrderStatus[] | undefined
} = {
  workOrderStatuses: undefined
}

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
  cache.workOrderStatuses ??= getWorkOrderStatusesFromDatabase()
  return cache.workOrderStatuses
}

export function clearWorkOrderStatusesCache(): void {
  cache.workOrderStatuses = undefined
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

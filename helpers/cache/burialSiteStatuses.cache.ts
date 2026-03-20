import getBurialSiteStatusesFromDatabase from '../../database/getBurialSiteStatuses.js'
import type { BurialSiteStatus } from '../../types/record.types.js'

let burialSiteStatuses: BurialSiteStatus[] | undefined

export function getCachedBurialSiteStatusByBurialSiteStatus(
  burialSiteStatus: string,
  includeDeleted = false
): BurialSiteStatus | undefined {
  const cachedStatuses = getCachedBurialSiteStatuses(includeDeleted)

  const statusLowerCase = burialSiteStatus.toLowerCase()

  return cachedStatuses.find(
    (currentStatus) =>
      currentStatus.burialSiteStatus.toLowerCase() === statusLowerCase
  )
}

export function getCachedBurialSiteStatusById(
  burialSiteStatusId: number
): BurialSiteStatus | undefined {
  const cachedStatuses = getCachedBurialSiteStatuses()

  return cachedStatuses.find(
    (currentStatus) => currentStatus.burialSiteStatusId === burialSiteStatusId
  )
}

export function getCachedBurialSiteStatuses(
  includeDeleted = false
): BurialSiteStatus[] {
  burialSiteStatuses ??= getBurialSiteStatusesFromDatabase(includeDeleted)
  return burialSiteStatuses
}

export function clearBurialSiteStatusesCache(): void {
  burialSiteStatuses = undefined
}

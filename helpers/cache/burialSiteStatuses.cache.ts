import getBurialSiteStatusesFromDatabase from '../../database/getBurialSiteStatuses.js'
import type { BurialSiteStatus } from '../../types/record.types.js'

const cache: {
  burialSiteStatuses: BurialSiteStatus[] | undefined
} = {
  burialSiteStatuses: undefined
}

export function getCachedBurialSiteStatusByBurialSiteStatus(
  burialSiteStatus: string,
  shouldIncludeDeleted = false
): BurialSiteStatus | undefined {
  const cachedStatuses = getCachedBurialSiteStatuses(shouldIncludeDeleted)

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
  shouldIncludeDeleted = false
): BurialSiteStatus[] {
  if (shouldIncludeDeleted) {
    return getBurialSiteStatusesFromDatabase(shouldIncludeDeleted)
  }

  cache.burialSiteStatuses ??=
    getBurialSiteStatusesFromDatabase(shouldIncludeDeleted)
  return cache.burialSiteStatuses
}

export function clearBurialSiteStatusesCache(): void {
  cache.burialSiteStatuses = undefined
}

import getBurialSiteStatusesFromDatabase from '../../database/getBurialSiteStatuses.js'
import type { BurialSiteStatus } from '../../types/record.types.js'

const cache: {
  burialSiteStatuses: BurialSiteStatus[] | undefined
} = {
  burialSiteStatuses: undefined
}

export function getCachedBurialSiteStatusByBurialSiteStatus(
  burialSiteStatus: string,
  shouldIncludeDeletedRecords = false
): BurialSiteStatus | undefined {
  const cachedStatuses = getCachedBurialSiteStatuses(
    shouldIncludeDeletedRecords
  )

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
  shouldIncludeDeletedRecords = false
): BurialSiteStatus[] {
  if (shouldIncludeDeletedRecords) {
    return getBurialSiteStatusesFromDatabase(shouldIncludeDeletedRecords)
  }

  cache.burialSiteStatuses ??= getBurialSiteStatusesFromDatabase(
    shouldIncludeDeletedRecords
  )

  return cache.burialSiteStatuses
}

export function clearBurialSiteStatusesCache(): void {
  cache.burialSiteStatuses = undefined
}

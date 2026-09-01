import getCemeteriesFromDatabase from '../../database/getCemeteries.js'
import type { Cemetery } from '../../types/record.types.js'

const cache: {
  cemeteries: Cemetery[] | undefined
} = {
  cemeteries: undefined
}

export function getCachedCemeteries(): Cemetery[] {
  cache.cemeteries ??= getCemeteriesFromDatabase()
  return cache.cemeteries
}

export function getCachedCemeteryById(
  cemeteryId: number
): Cemetery | undefined {
  const cachedCemeteries = getCachedCemeteries()

  return cachedCemeteries.find(
    (currentCemetery) => currentCemetery.cemeteryId === cemeteryId
  )
}

export function clearCemeteriesCache(): void {
  cache.cemeteries = undefined
}

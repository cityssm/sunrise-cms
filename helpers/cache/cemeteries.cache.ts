import type { DatabaseSync } from 'node:sqlite'

import getCemeteriesFromDatabase from '../../database/getCemeteries.js'
import type { Cemetery } from '../../types/record.types.js'

const cache: {
  cemeteries: Cemetery[] | undefined
} = {
  cemeteries: undefined
}

export function getCachedCemeteries(
  connectedDatabase?: DatabaseSync
): Cemetery[] {
  cache.cemeteries ??= getCemeteriesFromDatabase(undefined, connectedDatabase)
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

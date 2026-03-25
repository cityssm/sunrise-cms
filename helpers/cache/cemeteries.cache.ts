import getCemeteriesFromDatabase from '../../database/getCemeteries.js'
import type { Cemetery } from '../../types/record.types.js'

let cemeteries: Cemetery[] | undefined

export function getCachedCemeteries(): Cemetery[] {
  cemeteries ??= getCemeteriesFromDatabase()
  return cemeteries
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
  cemeteries = undefined
}

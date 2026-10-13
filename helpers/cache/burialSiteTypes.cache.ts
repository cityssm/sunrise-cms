import getBurialSiteTypesFromDatabase from '../../database/getBurialSiteTypes.js'
import type { BurialSiteType } from '../../types/record.types.js'

const cache: {
  burialSiteTypes: BurialSiteType[] | undefined
} = {
  burialSiteTypes: undefined
}

export function getCachedBurialSiteTypeById(
  burialSiteTypeId: number
): BurialSiteType | undefined {
  const cachedTypes = getCachedBurialSiteTypes()

  return cachedTypes.find(
    (currentType) => currentType.burialSiteTypeId === burialSiteTypeId
  )
}

export function getCachedBurialSiteTypes(
  shouldIncludeDeletedRecords = false
): BurialSiteType[] {
  if (shouldIncludeDeletedRecords) {
    return getBurialSiteTypesFromDatabase(shouldIncludeDeletedRecords)
  }

  cache.burialSiteTypes ??= getBurialSiteTypesFromDatabase()
  return cache.burialSiteTypes
}

export function getCachedBurialSiteTypesByBurialSiteType(
  burialSiteType: string,
  shouldIncludeDeletedRecords = false
): BurialSiteType | undefined {
  const cachedTypes = getCachedBurialSiteTypes(shouldIncludeDeletedRecords)

  const typeLowerCase = burialSiteType.toLowerCase()

  return cachedTypes.find(
    (currentType) => currentType.burialSiteType.toLowerCase() === typeLowerCase
  )
}

export function clearBurialSiteTypesCache(): void {
  cache.burialSiteTypes = undefined
}

import getBurialSiteTypesFromDatabase from '../../database/getBurialSiteTypes.js'
import type { BurialSiteType } from "../../types/record.types.js"

let burialSiteTypes: BurialSiteType[] | undefined

export function getCachedBurialSiteTypeById(
  burialSiteTypeId: number
): BurialSiteType | undefined {
  const cachedTypes = getCachedBurialSiteTypes()

  return cachedTypes.find(
    (currentType) => currentType.burialSiteTypeId === burialSiteTypeId
  )
}

export function getCachedBurialSiteTypes(includeDeleted = false): BurialSiteType[] {
  burialSiteTypes ??= getBurialSiteTypesFromDatabase(includeDeleted)
  return burialSiteTypes
}

export function getCachedBurialSiteTypesByBurialSiteType(
  burialSiteType: string,
  includeDeleted = false
): BurialSiteType | undefined {
  const cachedTypes = getCachedBurialSiteTypes(includeDeleted)

  const typeLowerCase = burialSiteType.toLowerCase()

  return cachedTypes.find(
    (currentType) => currentType.burialSiteType.toLowerCase() === typeLowerCase
  )
}

export function clearBurialSiteTypesCache(): void {
  burialSiteTypes = undefined
}
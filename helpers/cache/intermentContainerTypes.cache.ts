import getIntermentContainerTypesFromDatabase from '../../database/getIntermentContainerTypes.js'
import type { IntermentContainerType } from '../../types/record.types.js'

const cache: {
  intermentContainerTypes: IntermentContainerType[] | undefined
} = {
  intermentContainerTypes: undefined
}

export function getCachedIntermentContainerTypeById(
  intermentContainerTypeId: number
): IntermentContainerType | undefined {
  const cachedContainerTypes = getCachedIntermentContainerTypes()

  return cachedContainerTypes.find(
    (currentContainerType) =>
      currentContainerType.intermentContainerTypeId === intermentContainerTypeId
  )
}

export function getCachedIntermentContainerTypes(): IntermentContainerType[] {
  cache.intermentContainerTypes ??= getIntermentContainerTypesFromDatabase()
  return cache.intermentContainerTypes
}

export function clearIntermentContainerTypesCache(): void {
  cache.intermentContainerTypes = undefined
}

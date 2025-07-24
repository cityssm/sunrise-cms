import getIntermentContainerTypesFromDatabase from '../../database/getIntermentContainerTypes.js'
import type { IntermentContainerType } from '../../types/record.types.js'

let intermentContainerTypes: IntermentContainerType[] | undefined

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
  intermentContainerTypes ??= getIntermentContainerTypesFromDatabase()
  return intermentContainerTypes
}

export function clearIntermentContainerTypesCache(): void {
  intermentContainerTypes = undefined
}
import getServiceTypesFromDatabase from '../../database/getServiceTypes.js'
import type { ServiceType } from '../../types/record.types.js'

let serviceTypes: ServiceType[] | undefined

export function getCachedServiceTypeById(
  serviceTypeId: number
): ServiceType | undefined {
  const cachedServiceTypes = getCachedServiceTypes()

  return cachedServiceTypes.find(
    (currentServiceType) =>
      currentServiceType.serviceTypeId === serviceTypeId
  )
}

export function getCachedServiceTypes(): ServiceType[] {
  serviceTypes ??= getServiceTypesFromDatabase()
  return serviceTypes
}

export function clearServiceTypesCache(): void {
  serviceTypes = undefined
}

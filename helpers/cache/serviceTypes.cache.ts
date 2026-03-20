import getServiceTypesFromDatabase from '../../database/getServiceTypes.js'
import type { ServiceType } from '../../types/record.types.js'

let serviceTypes: ServiceType[] | undefined

export function getCachedServiceTypeById(
  serviceTypeId: number
): ServiceType | undefined {
  const cachedServiceTypes = getCachedServiceTypes()

  return cachedServiceTypes.find(
    (currentServiceType) => currentServiceType.serviceTypeId === serviceTypeId
  )
}

export function getCachedServiceTypes(): ServiceType[] {
  serviceTypes ??= getServiceTypesFromDatabase()
  return serviceTypes
}

export function getCachedServiceTypeByServiceType(
  serviceType: string
): ServiceType | undefined {
  const cachedServiceTypes = getCachedServiceTypes()

  const serviceTypeLowerCase = serviceType.toLowerCase()

  return cachedServiceTypes.find(
    (currentServiceType) =>
      currentServiceType.serviceType.toLowerCase() === serviceTypeLowerCase
  )
}

export function clearServiceTypesCache(): void {
  serviceTypes = undefined
}

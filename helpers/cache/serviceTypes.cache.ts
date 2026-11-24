import type { DatabaseSync } from 'node:sqlite'

import getServiceTypesFromDatabase from '../../database/getServiceTypes.js'
import type { ServiceType } from '../../types/record.types.js'

const cache: {
  serviceTypes: ServiceType[] | undefined
} = {
  serviceTypes: undefined
}

export function getCachedServiceTypeById(
  serviceTypeId: number
): ServiceType | undefined {
  const cachedServiceTypes = getCachedServiceTypes()

  return cachedServiceTypes.find(
    (currentServiceType) => currentServiceType.serviceTypeId === serviceTypeId
  )
}

export function getCachedServiceTypes(
  shouldIncludeDeletedRecords = false,
  connectedDatabase?: DatabaseSync
): ServiceType[] {
  if (shouldIncludeDeletedRecords) {
    return getServiceTypesFromDatabase(
      shouldIncludeDeletedRecords,
      connectedDatabase
    )
  }

  cache.serviceTypes ??= getServiceTypesFromDatabase(
    shouldIncludeDeletedRecords,
    connectedDatabase
  )

  return cache.serviceTypes
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
  cache.serviceTypes = undefined
}

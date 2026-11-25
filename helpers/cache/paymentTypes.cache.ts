import type { DatabaseSync } from 'node:sqlite'

import getPaymentTypesFromDatabase from '../../database/getPaymentTypes.js'
import type { PaymentType } from '../../types/record.types.js'

const cache: {
  paymentTypes: PaymentType[] | undefined
} = {
  paymentTypes: undefined
}

export function getCachedPaymentTypeById(
  paymentTypeId: number
): PaymentType | undefined {
  const cachedPaymentTypes = getCachedPaymentTypes()

  return cachedPaymentTypes.find(
    (currentPaymentType) => currentPaymentType.paymentTypeId === paymentTypeId
  )
}

export function getCachedPaymentTypes(
  shouldIncludeDeletedRecords = false,
  connectedDatabase?: DatabaseSync
): PaymentType[] {
  if (shouldIncludeDeletedRecords) {
    return getPaymentTypesFromDatabase(
      shouldIncludeDeletedRecords,
      connectedDatabase
    )
  }

  cache.paymentTypes ??= getPaymentTypesFromDatabase(
    shouldIncludeDeletedRecords,
    connectedDatabase
  )

  return cache.paymentTypes
}

export function getCachedPaymentTypeByPaymentType(
  paymentType: string
): PaymentType | undefined {
  const cachedPaymentTypes = getCachedPaymentTypes()

  const paymentTypeLowerCase = paymentType.toLowerCase()

  return cachedPaymentTypes.find(
    (currentPaymentType) =>
      currentPaymentType.paymentType.toLowerCase() === paymentTypeLowerCase
  )
}

export function clearPaymentTypesCache(): void {
  cache.paymentTypes = undefined
}

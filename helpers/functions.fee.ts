import type { BurialSiteContract, Fee } from '../types/recordTypes.js'

export function calculateFeeAmount(
  fee: Fee,
  burialSiteContract: BurialSiteContract
): number {
  return fee.feeFunction ? 0 : fee.feeAmount ?? 0
}

export function calculateTaxAmount(fee: Fee, feeAmount: number): number {
  return fee.taxPercentage
    ? feeAmount * (fee.taxPercentage / 100)
    : fee.taxAmount ?? 0
}

import type {
  LotOccupancy,
  LotOccupancyFee,
  LotOccupancyOccupant
} from '../types/recordTypes.js'

export function filterOccupantsByLotOccupantType(
  burialSiteContract: LotOccupancy,
  lotOccupantType: string
): LotOccupancyOccupant[] {
  const lotOccupantTypeLowerCase = lotOccupantType.toLowerCase()

  return (burialSiteContract.burialSiteContractOccupants ?? []).filter(
    (possibleOccupant) =>
      (possibleOccupant.lotOccupantType as string).toLowerCase() ===
      lotOccupantTypeLowerCase
  )
}

export function getFieldValueByOccupancyTypeField(
  burialSiteContract: LotOccupancy,
  occupancyTypeField: string
): string | undefined {
  const occupancyTypeFieldLowerCase = occupancyTypeField.toLowerCase()

  const field = (burialSiteContract.burialSiteContractFields ?? []).find(
    (possibleField) =>
      (possibleField.occupancyTypeField as string).toLowerCase() ===
      occupancyTypeFieldLowerCase
  )

  if (field === undefined) {
    return undefined
  }

  return field.burialSiteContractFieldValue
}

export function getFeesByFeeCategory(
  burialSiteContract: LotOccupancy,
  feeCategory: string,
  feeCategoryContains = false
): LotOccupancyFee[] {
  const feeCategoryLowerCase = feeCategory.toLowerCase()

  return (burialSiteContract.burialSiteContractFees ?? []).filter((possibleFee) =>
    feeCategoryContains
      ? (possibleFee.feeCategory as string)
          .toLowerCase()
          .includes(feeCategoryLowerCase)
      : (possibleFee.feeCategory as string).toLowerCase() ===
        feeCategoryLowerCase
  )
}

export function getTransactionTotal(burialSiteContract: LotOccupancy): number {
  let transactionTotal = 0

  for (const transaction of burialSiteContract.burialSiteContractTransactions ?? []) {
    transactionTotal += transaction.transactionAmount
  }

  return transactionTotal
}

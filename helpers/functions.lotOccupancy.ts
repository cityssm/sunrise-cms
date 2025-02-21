import type {
  LotOccupancy,
  LotOccupancyFee,
  LotOccupancyOccupant
} from '../types/recordTypes.js'

export function filterOccupantsByLotOccupantType(
  lotOccupancy: LotOccupancy,
  lotOccupantType: string
): LotOccupancyOccupant[] {
  const lotOccupantTypeLowerCase = lotOccupantType.toLowerCase()

  return (lotOccupancy.lotOccupancyOccupants ?? []).filter(
    (possibleOccupant) =>
      (possibleOccupant.lotOccupantType as string).toLowerCase() ===
      lotOccupantTypeLowerCase
  )
}

export function getFieldValueByOccupancyTypeField(
  lotOccupancy: LotOccupancy,
  occupancyTypeField: string
): string | undefined {
  const occupancyTypeFieldLowerCase = occupancyTypeField.toLowerCase()

  const field = (lotOccupancy.lotOccupancyFields ?? []).find(
    (possibleField) =>
      (possibleField.occupancyTypeField as string).toLowerCase() ===
      occupancyTypeFieldLowerCase
  )

  if (field === undefined) {
    return undefined
  }

  return field.lotOccupancyFieldValue
}

export function getFeesByFeeCategory(
  lotOccupancy: LotOccupancy,
  feeCategory: string,
  feeCategoryContains = false
): LotOccupancyFee[] {
  const feeCategoryLowerCase = feeCategory.toLowerCase()

  return (lotOccupancy.lotOccupancyFees ?? []).filter((possibleFee) =>
    feeCategoryContains
      ? (possibleFee.feeCategory as string)
          .toLowerCase()
          .includes(feeCategoryLowerCase)
      : (possibleFee.feeCategory as string).toLowerCase() ===
        feeCategoryLowerCase
  )
}

export function getTransactionTotal(lotOccupancy: LotOccupancy): number {
  let transactionTotal = 0

  for (const transaction of lotOccupancy.lotOccupancyTransactions ?? []) {
    transactionTotal += transaction.transactionAmount
  }

  return transactionTotal
}

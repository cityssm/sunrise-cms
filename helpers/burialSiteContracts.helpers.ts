import type {
  BurialSiteContract,
  BurialSiteContractFee
} from '../types/recordTypes.js'

export function getFieldValueByContractTypeField(
  burialSiteContract: BurialSiteContract,
  contractTypeField: string
): string | undefined {
  const contractTypeFieldLowerCase = contractTypeField.toLowerCase()

  const field = (burialSiteContract.burialSiteContractFields ?? []).find(
    (possibleField) =>
      (possibleField.contractTypeField as string).toLowerCase() ===
      contractTypeFieldLowerCase
  )

  if (field === undefined) {
    return undefined
  }

  return field.fieldValue
}

export function getFeesByFeeCategory(
  burialSiteContract: BurialSiteContract,
  feeCategory: string,
  feeCategoryContains = false
): BurialSiteContractFee[] {
  const feeCategoryLowerCase = feeCategory.toLowerCase()

  return (burialSiteContract.burialSiteContractFees ?? []).filter(
    (possibleFee) =>
      feeCategoryContains
        ? (possibleFee.feeCategory as string)
            .toLowerCase()
            .includes(feeCategoryLowerCase)
        : (possibleFee.feeCategory as string).toLowerCase() ===
          feeCategoryLowerCase
  )
}

export function getTransactionTotal(
  burialSiteContract: BurialSiteContract
): number {
  let transactionTotal = 0

  for (const transaction of burialSiteContract.burialSiteContractTransactions ??
    []) {
    transactionTotal += transaction.transactionAmount
  }

  return transactionTotal
}

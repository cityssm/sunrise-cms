import type {
  Contract,
  ContractFee
} from '../types/record.types.js'

export function getFeesByFeeCategory(
  contract: Contract,
  feeCategory: string,
  feeCategoryContains = false
): ContractFee[] {
  const feeCategoryLowerCase = feeCategory.toLowerCase()

  return (contract.contractFees ?? []).filter(
    (possibleFee) =>
      feeCategoryContains
        ? (possibleFee.feeCategory as string)
            .toLowerCase()
            .includes(feeCategoryLowerCase)
        : (possibleFee.feeCategory as string).toLowerCase() ===
          feeCategoryLowerCase
  )
}

export function getFieldValueByContractTypeField(
  contract: Contract,
  contractTypeField: string
): string | undefined {
  const contractTypeFieldLowerCase = contractTypeField.toLowerCase()

  const field = (contract.contractFields ?? []).find(
    (possibleField) =>
      (possibleField.contractTypeField as string).toLowerCase() ===
      contractTypeFieldLowerCase
  )

  if (field === undefined) {
    return undefined
  }

  return field.fieldValue
}

export function getTransactionTotal(
  contract: Contract
): number {
  let transactionTotal = 0

  for (const transaction of contract.contractTransactions ??
    []) {
    transactionTotal += transaction.transactionAmount
  }

  return transactionTotal
}

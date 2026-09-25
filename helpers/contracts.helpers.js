export function getFeesByFeeCategory(contract, feeCategory, feeCategoryContains = false) {
    const feeCategoryLowerCase = feeCategory.toLowerCase();
    return (contract.contractFees ?? []).filter((possibleFee) => feeCategoryContains
        ? possibleFee.feeCategory
            .toLowerCase()
            .includes(feeCategoryLowerCase)
        : possibleFee.feeCategory.toLowerCase() ===
            feeCategoryLowerCase);
}
export function getFieldValueByContractTypeField(contract, contractTypeField) {
    const contractTypeFieldLowerCase = contractTypeField.toLowerCase();
    const field = (contract.contractFields ?? []).find((possibleField) => possibleField.contractTypeField.toLowerCase() ===
        contractTypeFieldLowerCase);
    return field === undefined ? undefined : field.fieldValue;
}
export function getTransactionTotal(contract) {
    let transactionTotal = 0;
    const contractTransactions = contract.contractTransactions ?? [];
    for (const transaction of contractTransactions) {
        transactionTotal += transaction.transactionAmount;
    }
    return transactionTotal;
}

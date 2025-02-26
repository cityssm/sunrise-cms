export function getFieldValueByContractTypeField(burialSiteContract, contractTypeField) {
    const contractTypeFieldLowerCase = contractTypeField.toLowerCase();
    const field = (burialSiteContract.burialSiteContractFields ?? []).find((possibleField) => possibleField.contractTypeField.toLowerCase() ===
        contractTypeFieldLowerCase);
    if (field === undefined) {
        return undefined;
    }
    return field.fieldValue;
}
export function getFeesByFeeCategory(burialSiteContract, feeCategory, feeCategoryContains = false) {
    const feeCategoryLowerCase = feeCategory.toLowerCase();
    return (burialSiteContract.burialSiteContractFees ?? []).filter((possibleFee) => feeCategoryContains
        ? possibleFee.feeCategory
            .toLowerCase()
            .includes(feeCategoryLowerCase)
        : possibleFee.feeCategory.toLowerCase() ===
            feeCategoryLowerCase);
}
export function getTransactionTotal(burialSiteContract) {
    let transactionTotal = 0;
    for (const transaction of burialSiteContract.burialSiteContractTransactions ??
        []) {
        transactionTotal += transaction.transactionAmount;
    }
    return transactionTotal;
}

export function filterOccupantsByLotOccupantType(burialSiteContract, lotOccupantType) {
    const lotOccupantTypeLowerCase = lotOccupantType.toLowerCase();
    return (burialSiteContract.burialSiteContractOccupants ?? []).filter((possibleOccupant) => possibleOccupant.lotOccupantType.toLowerCase() ===
        lotOccupantTypeLowerCase);
}
export function getFieldValueByOccupancyTypeField(burialSiteContract, occupancyTypeField) {
    const occupancyTypeFieldLowerCase = occupancyTypeField.toLowerCase();
    const field = (burialSiteContract.burialSiteContractFields ?? []).find((possibleField) => possibleField.occupancyTypeField.toLowerCase() ===
        occupancyTypeFieldLowerCase);
    if (field === undefined) {
        return undefined;
    }
    return field.burialSiteContractFieldValue;
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
    for (const transaction of burialSiteContract.burialSiteContractTransactions ?? []) {
        transactionTotal += transaction.transactionAmount;
    }
    return transactionTotal;
}

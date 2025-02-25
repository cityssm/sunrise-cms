export function calculateFeeAmount(fee, burialSiteContract) {
    return fee.feeFunction ? 0 : fee.feeAmount ?? 0;
}
export function calculateTaxAmount(fee, feeAmount) {
    return fee.taxPercentage
        ? feeAmount * (fee.taxPercentage / 100)
        : fee.taxAmount ?? 0;
}

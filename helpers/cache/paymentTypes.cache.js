import getPaymentTypesFromDatabase from '../../database/getPaymentTypes.js';
const cache = {
    paymentTypes: undefined
};
export function getCachedPaymentTypeById(paymentTypeId) {
    const cachedPaymentTypes = getCachedPaymentTypes();
    return cachedPaymentTypes.find((currentPaymentType) => currentPaymentType.paymentTypeId === paymentTypeId);
}
export function getCachedPaymentTypes(shouldIncludeDeletedRecords = false, connectedDatabase) {
    if (shouldIncludeDeletedRecords) {
        return getPaymentTypesFromDatabase(shouldIncludeDeletedRecords, connectedDatabase);
    }
    cache.paymentTypes ??= getPaymentTypesFromDatabase(shouldIncludeDeletedRecords, connectedDatabase);
    return cache.paymentTypes;
}
export function getCachedPaymentTypeByPaymentType(paymentType) {
    const cachedPaymentTypes = getCachedPaymentTypes();
    const paymentTypeLowerCase = paymentType.toLowerCase();
    return cachedPaymentTypes.find((currentPaymentType) => currentPaymentType.paymentType.toLowerCase() === paymentTypeLowerCase);
}
export function clearPaymentTypesCache() {
    cache.paymentTypes = undefined;
}

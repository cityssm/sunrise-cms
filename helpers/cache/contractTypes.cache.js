import getContractTypeFieldsFromDatabase from '../../database/getContractTypeFields.js';
import getContractTypesFromDatabase from '../../database/getContractTypes.js';
import { getConfigProperty } from '../config.helpers.js';
const cache = {
    allContractTypeFields: undefined,
    contractTypes: undefined
};
export function getAllCachedContractTypeFields() {
    cache.allContractTypeFields ??= getContractTypeFieldsFromDatabase();
    return cache.allContractTypeFields;
}
export function getCachedContractTypeByContractType(contractTypeString, shouldIncludeDeleted = false) {
    const cachedTypes = getCachedContractTypes(shouldIncludeDeleted);
    const typeLowerCase = contractTypeString.toLowerCase();
    return cachedTypes.find((currentType) => currentType.contractType.toLowerCase() === typeLowerCase);
}
export function getCachedContractTypeById(contractTypeId) {
    const cachedTypes = getCachedContractTypes();
    return cachedTypes.find((currentType) => currentType.contractTypeId === contractTypeId);
}
export function getCachedContractTypePrintsById(contractTypeId) {
    const contractType = getCachedContractTypeById(contractTypeId);
    if (contractType?.contractTypePrints === undefined ||
        contractType.contractTypePrints.length === 0) {
        return [];
    }
    if (contractType.contractTypePrints.includes('*')) {
        return getConfigProperty('settings.contracts.prints');
    }
    return contractType.contractTypePrints ?? [];
}
export function getCachedContractTypes(shouldIncludeDeleted = false) {
    if (shouldIncludeDeleted) {
        return getContractTypesFromDatabase(shouldIncludeDeleted);
    }
    cache.contractTypes ??= getContractTypesFromDatabase(shouldIncludeDeleted);
    return cache.contractTypes;
}
export function clearContractTypesCache() {
    cache.contractTypes = undefined;
    cache.allContractTypeFields = undefined;
}

import getContractTypeFieldsFromDatabase from '../../database/getContractTypeFields.js';
import getContractTypesFromDatabase from '../../database/getContractTypes.js';
import { getConfigProperty } from '../config.helpers.js';
const cache = {
    allContractTypeFields: undefined,
    contractTypes: undefined
};
export function getAllCachedContractTypeFields(connectedDatabase) {
    cache.allContractTypeFields ??= getContractTypeFieldsFromDatabase(undefined, connectedDatabase);
    return cache.allContractTypeFields;
}
export function getCachedContractTypeByContractType(contractTypeString, shouldIncludeDeletedRecords = false) {
    const cachedTypes = getCachedContractTypes(shouldIncludeDeletedRecords);
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
    return contractType.contractTypePrints.includes('*')
        ? getConfigProperty('settings.contracts.prints')
        : (contractType.contractTypePrints ?? []);
}
export function getCachedContractTypes(shouldIncludeDeletedRecords = false, connectedDatabase) {
    if (shouldIncludeDeletedRecords) {
        return getContractTypesFromDatabase(shouldIncludeDeletedRecords, connectedDatabase);
    }
    cache.contractTypes ??= getContractTypesFromDatabase(shouldIncludeDeletedRecords, connectedDatabase);
    return cache.contractTypes;
}
export function clearContractTypesCache() {
    cache.contractTypes = undefined;
    cache.allContractTypeFields = undefined;
}

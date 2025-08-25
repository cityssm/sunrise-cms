import getContractTypeFieldsFromDatabase from '../../database/getContractTypeFields.js';
import getContractTypesFromDatabase from '../../database/getContractTypes.js';
import { getConfigProperty } from '../config.helpers.js';
let contractTypes;
let allContractTypeFields;
export function getAllCachedContractTypeFields() {
    allContractTypeFields ??= getContractTypeFieldsFromDatabase();
    return allContractTypeFields;
}
export function getCachedContractTypeByContractType(contractTypeString, includeDeleted = false) {
    const cachedTypes = getCachedContractTypes(includeDeleted);
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
export function getCachedContractTypes(includeDeleted = false) {
    contractTypes ??= getContractTypesFromDatabase(includeDeleted);
    return contractTypes;
}
export function clearContractTypesCache() {
    contractTypes = undefined;
    allContractTypeFields = undefined;
}

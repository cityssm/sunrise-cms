import getContractTypeFieldsFromDatabase from '../../database/getContractTypeFields.js';
import getContractTypesFromDatabase from '../../database/getContractTypes.js';
import { getConfigProperty } from '../config.helpers.js';
let contractTypes;
let allContractTypeFields;
export function getAllCachedContractTypeFields() {
    allContractTypeFields !== null && allContractTypeFields !== void 0 ? allContractTypeFields : (allContractTypeFields = getContractTypeFieldsFromDatabase());
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
    var _a;
    const contractType = getCachedContractTypeById(contractTypeId);
    if ((contractType === null || contractType === void 0 ? void 0 : contractType.contractTypePrints) === undefined ||
        contractType.contractTypePrints.length === 0) {
        return [];
    }
    if (contractType.contractTypePrints.includes('*')) {
        return getConfigProperty('settings.contracts.prints');
    }
    return (_a = contractType.contractTypePrints) !== null && _a !== void 0 ? _a : [];
}
export function getCachedContractTypes(includeDeleted = false) {
    contractTypes !== null && contractTypes !== void 0 ? contractTypes : (contractTypes = getContractTypesFromDatabase(includeDeleted));
    return contractTypes;
}
export function clearContractTypesCache() {
    contractTypes = undefined;
    allContractTypeFields = undefined;
}

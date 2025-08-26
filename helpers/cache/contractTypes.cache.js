"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCachedContractTypeFields = getAllCachedContractTypeFields;
exports.getCachedContractTypeByContractType = getCachedContractTypeByContractType;
exports.getCachedContractTypeById = getCachedContractTypeById;
exports.getCachedContractTypePrintsById = getCachedContractTypePrintsById;
exports.getCachedContractTypes = getCachedContractTypes;
exports.clearContractTypesCache = clearContractTypesCache;
const getContractTypeFields_js_1 = require("../../database/getContractTypeFields.js");
const getContractTypes_js_1 = require("../../database/getContractTypes.js");
const config_helpers_js_1 = require("../config.helpers.js");
let contractTypes;
let allContractTypeFields;
function getAllCachedContractTypeFields() {
    allContractTypeFields !== null && allContractTypeFields !== void 0 ? allContractTypeFields : (allContractTypeFields = (0, getContractTypeFields_js_1.default)());
    return allContractTypeFields;
}
function getCachedContractTypeByContractType(contractTypeString, includeDeleted = false) {
    const cachedTypes = getCachedContractTypes(includeDeleted);
    const typeLowerCase = contractTypeString.toLowerCase();
    return cachedTypes.find((currentType) => currentType.contractType.toLowerCase() === typeLowerCase);
}
function getCachedContractTypeById(contractTypeId) {
    const cachedTypes = getCachedContractTypes();
    return cachedTypes.find((currentType) => currentType.contractTypeId === contractTypeId);
}
function getCachedContractTypePrintsById(contractTypeId) {
    var _a;
    const contractType = getCachedContractTypeById(contractTypeId);
    if ((contractType === null || contractType === void 0 ? void 0 : contractType.contractTypePrints) === undefined ||
        contractType.contractTypePrints.length === 0) {
        return [];
    }
    if (contractType.contractTypePrints.includes('*')) {
        return (0, config_helpers_js_1.getConfigProperty)('settings.contracts.prints');
    }
    return (_a = contractType.contractTypePrints) !== null && _a !== void 0 ? _a : [];
}
function getCachedContractTypes(includeDeleted = false) {
    contractTypes !== null && contractTypes !== void 0 ? contractTypes : (contractTypes = (0, getContractTypes_js_1.default)(includeDeleted));
    return contractTypes;
}
function clearContractTypesCache() {
    contractTypes = undefined;
    allContractTypeFields = undefined;
}

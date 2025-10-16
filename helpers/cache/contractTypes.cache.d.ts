import type { ContractType, ContractTypeField } from '../../types/record.types.js';
export declare function getAllCachedContractTypeFields(): ContractTypeField[];
export declare function getCachedContractTypeByContractType(contractTypeString: string, includeDeleted?: boolean): ContractType | undefined;
export declare function getCachedContractTypeById(contractTypeId: number): ContractType | undefined;
export declare function getCachedContractTypePrintsById(contractTypeId: number): string[];
export declare function getCachedContractTypes(includeDeleted?: boolean): ContractType[];
export declare function clearContractTypesCache(): void;

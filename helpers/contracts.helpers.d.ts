import type { Contract, ContractFee } from '../types/record.types.js';
export declare function getFeesByFeeCategory(contract: Contract, feeCategory: string, feeCategoryContains?: boolean): ContractFee[];
export declare function getFieldValueByContractTypeField(contract: Contract, contractTypeField: string): string | undefined;
export declare function getTransactionTotal(contract: Contract): number;

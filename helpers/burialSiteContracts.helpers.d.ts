import type { BurialSiteContract, BurialSiteContractFee } from '../types/recordTypes.js';
export declare function getFieldValueByContractTypeField(burialSiteContract: BurialSiteContract, occupancyTypeField: string): string | undefined;
export declare function getFeesByFeeCategory(burialSiteContract: BurialSiteContract, feeCategory: string, feeCategoryContains?: boolean): BurialSiteContractFee[];
export declare function getTransactionTotal(burialSiteContract: BurialSiteContract): number;

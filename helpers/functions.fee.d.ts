import type { BurialSiteContract, Fee } from '../types/recordTypes.js';
export declare function calculateFeeAmount(fee: Fee, burialSiteContract: BurialSiteContract): number;
export declare function calculateTaxAmount(fee: Fee, feeAmount: number): number;

import type { Contract, Fee } from '../types/recordTypes.js';
export declare function calculateFeeAmount(fee: Fee, contract: Contract): number;
export declare function calculateTaxAmount(fee: Fee, feeAmount: number): number;

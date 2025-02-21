import type { LotOccupancy, LotOccupancyFee, LotOccupancyOccupant } from '../types/recordTypes.js';
export declare function filterOccupantsByLotOccupantType(lotOccupancy: LotOccupancy, lotOccupantType: string): LotOccupancyOccupant[];
export declare function getFieldValueByOccupancyTypeField(lotOccupancy: LotOccupancy, occupancyTypeField: string): string | undefined;
export declare function getFeesByFeeCategory(lotOccupancy: LotOccupancy, feeCategory: string, feeCategoryContains?: boolean): LotOccupancyFee[];
export declare function getTransactionTotal(lotOccupancy: LotOccupancy): number;

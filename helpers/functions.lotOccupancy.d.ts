import type { LotOccupancy, LotOccupancyFee, LotOccupancyOccupant } from '../types/recordTypes.js';
export declare function filterOccupantsByLotOccupantType(burialSiteContract: LotOccupancy, lotOccupantType: string): LotOccupancyOccupant[];
export declare function getFieldValueByOccupancyTypeField(burialSiteContract: LotOccupancy, occupancyTypeField: string): string | undefined;
export declare function getFeesByFeeCategory(burialSiteContract: LotOccupancy, feeCategory: string, feeCategoryContains?: boolean): LotOccupancyFee[];
export declare function getTransactionTotal(burialSiteContract: LotOccupancy): number;

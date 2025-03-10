export declare function getFeeIdByFeeDescription(feeDescription: string): number;
export declare const preneedOwnerLotOccupantTypeId: any;
export declare const funeralDirectorLotOccupantTypeId: any;
export declare const deceasedLotOccupantTypeId: any;
export declare const purchaserLotOccupantTypeId: any;
export declare const availableburialSiteStatusId: any;
export declare const reservedburialSiteStatusId: any;
export declare const takenburialSiteStatusId: any;
export declare function getburialSiteTypeId(dataRow: {
    cemetery: string;
}): number;
export declare const preneedContractType: import("../types/recordTypes.js").ContractType;
export declare const deceasedContractType: import("../types/recordTypes.js").ContractType;
export declare const cremationContractType: import("../types/recordTypes.js").ContractType;
export declare const acknowledgedWorkOrderMilestoneTypeId: number | undefined;
export declare const deathWorkOrderMilestoneTypeId: number | undefined;
export declare const funeralWorkOrderMilestoneTypeId: number | undefined;
export declare const cremationWorkOrderMilestoneTypeId: number | undefined;
export declare const intermentWorkOrderMilestoneTypeId: number | undefined;
export declare const workOrderTypeId = 1;

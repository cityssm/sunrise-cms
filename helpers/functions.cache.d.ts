import type { BurialSiteStatus, BurialSiteType, ContractType, ContractTypeField, WorkOrderMilestoneType, WorkOrderType } from '../types/recordTypes.js';
export declare function getBurialSiteStatuses(): Promise<BurialSiteStatus[]>;
export declare function getBurialSiteStatusById(burialSiteStatusId: number): Promise<BurialSiteStatus | undefined>;
export declare function getBurialSiteStatusByBurialSiteStatus(burialSiteStatus: string): Promise<BurialSiteStatus | undefined>;
export declare function getBurialSiteTypes(): Promise<BurialSiteType[]>;
export declare function getBurialSiteTypeById(burialSiteTypeId: number): Promise<BurialSiteType | undefined>;
export declare function getBurialSiteTypesByBurialSiteType(burialSiteType: string): Promise<BurialSiteType | undefined>;
export declare function getContractTypes(): Promise<ContractType[]>;
export declare function getAllContractTypeFields(): Promise<ContractTypeField[]>;
export declare function getContractTypeById(contractTypeId: number): Promise<ContractType | undefined>;
export declare function getContractTypeByContractType(contractTypeString: string): Promise<ContractType | undefined>;
export declare function getContractTypePrintsById(contractTypeId: number): Promise<string[]>;
export declare function getWorkOrderTypes(): Promise<WorkOrderType[]>;
export declare function getWorkOrderTypeById(workOrderTypeId: number): Promise<WorkOrderType | undefined>;
export declare function getWorkOrderMilestoneTypes(): Promise<WorkOrderMilestoneType[]>;
export declare function getWorkOrderMilestoneTypeById(workOrderMilestoneTypeId: number): Promise<WorkOrderMilestoneType | undefined>;
export declare function getWorkOrderMilestoneTypeByWorkOrderMilestoneType(workOrderMilestoneTypeString: string): Promise<WorkOrderMilestoneType | undefined>;
export declare function preloadCaches(): Promise<void>;
export declare function clearCaches(): void;
type CacheTableNames = 'BurialSiteStatuses' | 'BurialSiteTypes' | 'BurialSiteTypeFields' | 'ContractTypes' | 'ContractTypeFields' | 'ContractTypePrints' | 'WorkOrderMilestoneTypes' | 'WorkOrderTypes' | 'FeeCategories';
export declare function clearCacheByTableName(tableName: CacheTableNames, relayMessage?: boolean): void;
export {};

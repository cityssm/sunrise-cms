import type { PoolConnection } from 'better-sqlite-pool';
type RecordTable = 'BurialSiteStatuses' | 'BurialSiteTypeFields' | 'BurialSiteTypes' | 'CommittalTypes' | 'ContractTypeFields' | 'ContractTypes' | 'FeeCategories' | 'Fees' | 'IntermentContainerTypes' | 'WorkOrderMilestoneTypes' | 'WorkOrderTypes';
export declare function updateRecordOrderNumber(recordTable: RecordTable, recordId: number | string, orderNumber: number | string, connectedDatabase: PoolConnection): boolean;
export {};

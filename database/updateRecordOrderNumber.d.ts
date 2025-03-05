import type { PoolConnection } from 'better-sqlite-pool';
type RecordTable = 'FeeCategories' | 'Fees' | 'BurialSiteStatuses' | 'BurialSiteTypes' | 'BurialSiteTypeFields' | 'IntermentContainerTypes' | 'CommittalTypes' | 'ContractTypes' | 'ContractTypeFields' | 'WorkOrderMilestoneTypes' | 'WorkOrderTypes';
export declare function updateRecordOrderNumber(recordTable: RecordTable, recordId: number | string, orderNumber: number | string, connectedDatabase: PoolConnection): boolean;
export {};

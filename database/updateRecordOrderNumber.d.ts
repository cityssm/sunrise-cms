import type sqlite from 'better-sqlite3';
type RecordTable = 'BurialSiteStatuses' | 'BurialSiteTypeFields' | 'BurialSiteTypes' | 'CommittalTypes' | 'ContractTypeFields' | 'ContractTypes' | 'FeeCategories' | 'Fees' | 'IntermentContainerTypes' | 'WorkOrderMilestoneTypes' | 'WorkOrderTypes';
export declare function updateRecordOrderNumber(recordTable: RecordTable, recordId: number | string, orderNumber: number | string, connectedDatabase: sqlite.Database): boolean;
export {};

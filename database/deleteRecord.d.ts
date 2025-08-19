import sqlite from 'better-sqlite3';
type RecordTable = 'BurialSiteComments' | 'BurialSiteStatuses' | 'BurialSiteTypeFields' | 'BurialSiteTypes' | 'CommittalTypes' | 'ContractComments' | 'ContractTypeFields' | 'ContractTypes' | 'FeeCategories' | 'Fees' | 'IntermentContainerTypes' | 'WorkOrderComments' | 'WorkOrderMilestones' | 'WorkOrderMilestoneTypes' | 'WorkOrders' | 'WorkOrderTypes';
export declare function deleteRecord(recordTable: RecordTable, recordId: number | string, user: User, connectedDatabase?: sqlite.Database): boolean;
export {};

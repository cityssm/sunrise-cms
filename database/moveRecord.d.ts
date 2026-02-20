import sqlite from 'better-sqlite3';
type RecordTable = 'BurialSiteStatuses' | 'BurialSiteTypes' | 'CommittalTypes' | 'ContractTypes' | 'FeeCategories' | 'IntermentContainerTypes' | 'IntermentDepths' | 'ServiceTypes' | 'WorkOrderMilestoneTypes' | 'WorkOrderTypes';
export declare function moveRecordDown(recordTable: RecordTable, recordId: number | string, connectedDatabase?: sqlite.Database): boolean;
export declare function moveRecordDownToBottom(recordTable: RecordTable, recordId: number | string, connectedDatabase?: sqlite.Database): boolean;
export declare function moveRecordUp(recordTable: RecordTable, recordId: number | string, connectedDatabase?: sqlite.Database): boolean;
export declare function moveRecordUpToTop(recordTable: RecordTable, recordId: number | string, connectedDatabase?: sqlite.Database): boolean;
export {};

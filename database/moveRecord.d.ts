type RecordTable = 'BurialSiteStatuses' | 'BurialSiteTypes' | 'CommittalTypes' | 'ContractTypes' | 'FeeCategories' | 'IntermentContainerTypes' | 'WorkOrderMilestoneTypes' | 'WorkOrderTypes';
export declare function moveRecordDown(recordTable: RecordTable, recordId: number | string): boolean;
export declare function moveRecordDownToBottom(recordTable: RecordTable, recordId: number | string): boolean;
export declare function moveRecordUp(recordTable: RecordTable, recordId: number | string): boolean;
export declare function moveRecordUpToTop(recordTable: RecordTable, recordId: number | string): boolean;
export {};

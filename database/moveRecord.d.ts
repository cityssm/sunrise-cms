type RecordTable = 'BurialSiteStatuses' | 'BurialSiteTypes' | 'ContractTypes' | 'FeeCategories' | 'WorkOrderMilestoneTypes' | 'WorkOrderTypes';
export declare function moveRecordDown(recordTable: RecordTable, recordId: number | string): Promise<boolean>;
export declare function moveRecordDownToBottom(recordTable: RecordTable, recordId: number | string): Promise<boolean>;
export declare function moveRecordUp(recordTable: RecordTable, recordId: number | string): Promise<boolean>;
export declare function moveRecordUpToTop(recordTable: RecordTable, recordId: number | string): Promise<boolean>;
export {};

type RecordTable = 'BurialSiteStatuses' | 'CommittalTypes' | 'WorkOrderMilestoneTypes' | 'WorkOrderTypes';
export declare function updateRecord(recordTable: RecordTable, recordId: number | string, recordName: string, user: User): boolean;
export {};

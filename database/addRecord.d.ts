type RecordTable = 'BurialSiteStatuses' | 'BurialSiteTypes' | 'IntermentContainerTypes' | 'IntermentCommittalTypes' | 'WorkOrderMilestoneTypes' | 'WorkOrderTypes';
export default function addRecord(recordTable: RecordTable, recordName: string, orderNumber: number | string, user: User): Promise<number>;
export {};

type RecordTable = 'BurialSiteStatuses' | 'WorkOrderMilestoneTypes' | 'WorkOrderTypes';
export default function addRecord(recordTable: RecordTable, recordName: string, orderNumber: number | string, user: User): number;
export {};

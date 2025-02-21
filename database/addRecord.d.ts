type RecordTable = 'BurialSiteStatuses' | 'BurialSiteTypes' | 'ContractTypes' | 'WorkOrderMilestoneTypes' | 'WorkOrderTypes';
export default function addRecord(recordTable: RecordTable, recordName: string, orderNumber: number | string, user: User): Promise<number>;
export {};

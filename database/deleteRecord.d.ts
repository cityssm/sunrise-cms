type RecordTable = 'BurialSiteComments' | 'BurialSites' | 'BurialSiteStatuses' | 'BurialSiteTypeFields' | 'BurialSiteTypes' | 'Cemeteries' | 'ContractComments' | 'Contracts' | 'ContractTypeFields' | 'ContractTypes' | 'FeeCategories' | 'Fees' | 'FuneralHomes' | 'WorkOrderComments' | 'WorkOrderMilestones' | 'WorkOrderMilestoneTypes' | 'WorkOrders' | 'WorkOrderTypes';
export declare function deleteRecord(recordTable: RecordTable, recordId: number | string, user: User): Promise<boolean>;
export {};

type RecordTable = 'BurialSiteComments' | 'BurialSiteStatuses' | 'BurialSiteTypeFields' | 'BurialSiteTypes' | 'CommittalTypes' | 'ContractComments' | 'Contracts' | 'ContractTypeFields' | 'ContractTypes' | 'FeeCategories' | 'Fees' | 'IntermentContainerTypes' | 'WorkOrderComments' | 'WorkOrderMilestones' | 'WorkOrderMilestoneTypes' | 'WorkOrders' | 'WorkOrderTypes';
export declare function deleteRecord(recordTable: RecordTable, recordId: number | string, user: User): boolean;
export {};

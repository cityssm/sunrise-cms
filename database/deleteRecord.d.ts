type RecordTable = 'FeeCategories' | 'Fees' | 'BurialSites' | 'BurialSiteComments' | 'BurialSiteContracts' | 'BurialSiteContractComments' | 'BurialSiteStatuses' | 'BurialSiteTypes' | 'BurialSiteTypeFields' | 'Cemeteries' | 'ContractTypes' | 'ContractTypeFields' | 'WorkOrders' | 'WorkOrderComments' | 'WorkOrderMilestones' | 'WorkOrderMilestoneTypes' | 'WorkOrderTypes';
export declare function deleteRecord(recordTable: RecordTable, recordId: number | string, user: User): Promise<boolean>;
export {};

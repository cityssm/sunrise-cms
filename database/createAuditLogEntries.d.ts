import type { Difference } from '@cityssm/object-difference';
import type sqlite from 'better-sqlite3';
type MainRecordType = 'burialSite' | 'burialSiteStatus' | 'burialSiteType' | 'cemetery' | 'committalType' | 'contract' | 'contractType' | 'fee' | 'funeralHome' | 'intermentContainerType' | 'intermentDepth' | 'serviceType' | 'user' | 'workOrder' | 'workOrderMilestoneType' | 'workOrderType';
type UpdateTable = 'BurialSiteComments' | 'BurialSites' | 'BurialSiteStatuses' | 'BurialSiteTypes' | 'Cemeteries' | 'CemeteryDirectionsOfArrival' | 'CommittalTypes' | 'ContractAttachments' | 'ContractComments' | 'ContractFees' | 'ContractInterments' | 'ContractServiceTypes' | 'ContractTransactions' | 'Contracts' | 'ContractTypes' | 'Fees' | 'FuneralHomes' | 'IntermentContainerTypes' | 'IntermentDepths' | 'ServiceTypes' | 'Users' | 'WorkOrderBurialSites' | 'WorkOrderComments' | 'WorkOrderContracts' | 'WorkOrderMilestones' | 'WorkOrderMilestoneTypes' | 'WorkOrders' | 'WorkOrderTypes';
export default function createAuditLogEntries(record: {
    mainRecordType: MainRecordType;
    mainRecordId: string;
    updateTable: UpdateTable;
    recordIndex?: string;
}, differences: Difference[], user: User, connectedDatabase: sqlite.Database): number;
export {};

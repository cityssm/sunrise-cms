import type { Difference } from '@cityssm/object-difference';
import type sqlite from 'better-sqlite3';
type MainRecordType = 'burialSite' | 'burialSiteStatus' | 'burialSiteType' | 'cemetery' | 'committalType' | 'contract' | 'contractType' | 'fee' | 'funeralHome' | 'intermentContainerType' | 'intermentDepth' | 'serviceType' | 'user' | 'workOrder' | 'workOrderMilestoneType' | 'workOrderType';
type UpdateTable = 'BurialSiteComments' | 'BurialSites' | 'BurialSiteStatuses' | 'BurialSiteTypes' | 'Cemeteries' | 'CemeteryDirectionsOfArrival' | 'CommittalTypes' | 'ContractAttachments' | 'ContractComments' | 'ContractFees' | 'ContractInterments' | 'Contracts' | 'ContractServiceTypes' | 'ContractTransactions' | 'ContractTypes' | 'Fees' | 'FuneralHomes' | 'IntermentContainerTypes' | 'IntermentDepths' | 'ServiceTypes' | 'Users' | 'WorkOrderBurialSites' | 'WorkOrderComments' | 'WorkOrderContracts' | 'WorkOrderMilestones' | 'WorkOrderMilestoneTypes' | 'WorkOrders' | 'WorkOrderTypes';
export default function createAuditLogEntries(record: {
    mainRecordId: bigint | number | string;
    mainRecordType: MainRecordType;
    recordIndex?: bigint | number | string;
    updateTable: UpdateTable;
}, differences: Difference[], user: User, connectedDatabase: sqlite.Database): number;
export {};

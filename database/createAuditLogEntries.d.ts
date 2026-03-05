import type { Difference } from '@cityssm/object-difference';
import type sqlite from 'better-sqlite3';
type MainRecordType = 'burialSite' | 'burialSiteStatus' | 'cemetery' | 'committalType' | 'contract' | 'intermentContainerType' | 'intermentDepth' | 'serviceType' | 'user' | 'workOrder' | 'workOrderMilestoneType' | 'workOrderType';
type UpdateTable = 'BurialSites' | 'BurialSiteStatuses' | 'Cemeteries' | 'CemeteryDirectionsOfArrival' | 'CommittalTypes' | 'Contracts' | 'IntermentContainerTypes' | 'IntermentDepths' | 'ServiceTypes' | 'Users' | 'WorkOrderMilestoneTypes' | 'WorkOrders' | 'WorkOrderTypes';
export default function createAuditLogEntries(record: {
    mainRecordType: MainRecordType;
    mainRecordId: string;
    updateTable: UpdateTable;
    recordIndex?: string;
}, differences: Difference[], user: User, connectedDatabase: sqlite.Database): number;
export {};

import type { Difference } from '@cityssm/object-difference';
import type sqlite from 'better-sqlite3';
type MainRecordType = 'burialSite' | 'cemetery' | 'contract' | 'user' | 'workOrder';
type UpdateTable = 'BurialSites' | 'Cemeteries' | 'CemeteryDirectionsOfArrival' | 'Contracts' | 'Users' | 'WorkOrders';
export default function createAuditLogEntries(record: {
    mainRecordType: MainRecordType;
    mainRecordId: number | string;
    updateTable: UpdateTable;
    recordIndex?: string;
}, differences: Difference[], user: User, connectedDatabase: sqlite.Database): number;
export {};

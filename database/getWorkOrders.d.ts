import { type DateString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import type { WorkOrder } from '../types/record.types.js';
export interface GetWorkOrdersFilters {
    workOrderTypeId?: number | string;
    workOrderOpenDateString?: string;
    workOrderOpenStatus?: '' | 'closed' | 'open';
    burialSiteName?: string;
    cemeteryId?: number | string;
    contractId?: number | string;
    deceasedName?: string;
    funeralHomeId?: number | string;
    workOrderMilestoneDateString?: DateString;
}
export interface GetWorkOrdersOptions {
    /** -1 = no limit */
    limit: number;
    offset: number | string;
    includeBurialSites?: boolean;
    includeComments?: boolean;
    includeMilestones?: boolean;
}
export declare function getWorkOrders(filters: GetWorkOrdersFilters, options: GetWorkOrdersOptions, connectedDatabase?: sqlite.Database): Promise<{
    count: number;
    workOrders: WorkOrder[];
}>;
export default getWorkOrders;

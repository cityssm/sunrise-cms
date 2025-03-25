import type { PoolConnection } from 'better-sqlite-pool';
import type { WorkOrder } from '../types/recordTypes.js';
export interface GetWorkOrdersFilters {
    workOrderTypeId?: number | string;
    workOrderOpenDateString?: string;
    workOrderOpenStatus?: '' | 'closed' | 'open';
    burialSiteName?: string;
    contractId?: number | string;
    deceasedName?: string;
}
interface GetWorkOrdersOptions {
    limit: number;
    offset: number;
    includeBurialSites?: boolean;
    includeComments?: boolean;
    includeMilestones?: boolean;
}
export declare function getWorkOrders(filters: GetWorkOrdersFilters, options: GetWorkOrdersOptions, connectedDatabase?: PoolConnection): Promise<{
    count: number;
    workOrders: WorkOrder[];
}>;
export default getWorkOrders;

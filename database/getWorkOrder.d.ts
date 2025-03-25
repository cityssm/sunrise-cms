import type { PoolConnection } from 'better-sqlite-pool';
import type { WorkOrder } from '../types/recordTypes.js';
interface WorkOrderOptions {
    includeBurialSites: boolean;
    includeComments: boolean;
    includeMilestones: boolean;
}
export default function getWorkOrder(workOrderId: number | string, options: WorkOrderOptions, connectedDatabase?: PoolConnection): Promise<undefined | WorkOrder>;
export declare function getWorkOrderByWorkOrderNumber(workOrderNumber: string): Promise<undefined | WorkOrder>;
export {};

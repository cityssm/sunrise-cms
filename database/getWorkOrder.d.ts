import type { PoolConnection } from 'better-sqlite-pool';
import type { WorkOrder } from '../types/recordTypes.js';
interface WorkOrderOptions {
    includeBurialSites: boolean;
    includeComments: boolean;
    includeMilestones: boolean;
}
export declare function getWorkOrderByWorkOrderNumber(workOrderNumber: string): Promise<WorkOrder | undefined>;
export default function getWorkOrder(workOrderId: number | string, options: WorkOrderOptions, connectedDatabase?: PoolConnection): Promise<WorkOrder | undefined>;
export {};

import type { PoolConnection } from 'better-sqlite-pool';
import { type DateString } from '@cityssm/utils-datetime';
import type { WorkOrderMilestone } from '../types/recordTypes.js';
export interface WorkOrderMilestoneFilters {
    workOrderId?: number | string;
    workOrderMilestoneTypeIds?: string;
    workOrderTypeIds?: string;
    workOrderMilestoneDateFilter?: 'blank' | 'date' | 'notBlank' | 'recent' | 'upcomingMissed';
    workOrderMilestoneDateString?: '' | DateString;
}
interface WorkOrderMilestoneOptions {
    includeWorkOrders?: boolean;
    orderBy: 'completion' | 'date';
}
export default function getWorkOrderMilestones(filters: WorkOrderMilestoneFilters, options: WorkOrderMilestoneOptions, connectedDatabase?: PoolConnection): Promise<WorkOrderMilestone[]>;
export {};

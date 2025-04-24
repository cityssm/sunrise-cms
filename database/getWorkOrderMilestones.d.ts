import { type DateString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import type { WorkOrderMilestone } from '../types/record.types.js';
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
export default function getWorkOrderMilestones(filters: WorkOrderMilestoneFilters, options: WorkOrderMilestoneOptions, connectedDatabase?: sqlite.Database): Promise<WorkOrderMilestone[]>;
export {};

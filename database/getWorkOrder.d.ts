import sqlite from 'better-sqlite3';
import type { WorkOrder } from '../types/record.types.js';
interface WorkOrderOptions {
    includeBurialSites: boolean;
    includeComments: boolean;
    includeMilestones: boolean;
}
export default function getWorkOrder(workOrderId: number | string, options: WorkOrderOptions, connectedDatabase?: sqlite.Database): Promise<WorkOrder | undefined>;
export declare function getWorkOrderByWorkOrderNumber(workOrderNumber: string): Promise<WorkOrder | undefined>;
export {};

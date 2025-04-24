import type { PoolConnection } from 'better-sqlite-pool';
import type { WorkOrderComment } from '../types/record.types.js';
export default function getWorkOrderComments(workOrderId: number | string, connectedDatabase?: PoolConnection): Promise<WorkOrderComment[]>;

import sqlite from 'better-sqlite3';
import type { WorkOrderComment } from '../types/record.types.js';
export default function getWorkOrderComments(workOrderId: number | string, connectedDatabase?: sqlite.Database): WorkOrderComment[];

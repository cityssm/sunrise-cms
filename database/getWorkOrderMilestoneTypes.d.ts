import sqlite from 'better-sqlite3';
import type { WorkOrderMilestoneType } from '../types/record.types.js';
export default function getWorkOrderMilestoneTypes(includeDeleted?: boolean, connectedDatabase?: sqlite.Database | undefined): WorkOrderMilestoneType[];

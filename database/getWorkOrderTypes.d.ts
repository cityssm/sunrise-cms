import sqlite from 'better-sqlite3';
import type { WorkOrderType } from '../types/record.types.js';
export default function getWorkOrderTypes(connectedDatabase?: sqlite.Database): WorkOrderType[];

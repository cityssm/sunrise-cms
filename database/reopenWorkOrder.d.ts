import sqlite from 'better-sqlite3';
export default function reopenWorkOrder(workOrderId: number | string, user: User, connectedDatabase?: sqlite.Database): boolean;

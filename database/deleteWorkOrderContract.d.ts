import sqlite from 'better-sqlite3';
export default function deleteWorkOrderContract(workOrderId: number | string, contractId: number | string, user: User, connectedDatabase?: sqlite.Database): boolean;

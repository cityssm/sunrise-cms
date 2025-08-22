import sqlite from 'better-sqlite3';
type RecordTable = 'BurialSiteStatuses' | 'WorkOrderMilestoneTypes' | 'WorkOrderTypes';
export default function addRecord(recordTable: RecordTable, recordName: string, orderNumber: number | string, user: User, connectedDatabase?: sqlite.Database): number;
export {};

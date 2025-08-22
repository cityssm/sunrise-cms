import sqlite from 'better-sqlite3';
export declare const defaultRecordLimit = 100;
export type RecordType = 'contract' | 'contractTransactions' | 'workOrder' | 'workOrderMilestone';
export interface RecordUpdateLog {
    recordType: RecordType;
    updateType: 'create' | 'update';
    displayRecordId: string;
    recordId: number;
    recordDescription: number;
    recordUpdate_timeMillis: number;
    recordUpdate_userName: string;
}
export default function getRecordUpdateLog(filters: {
    recordType: '' | RecordType;
}, options?: {
    limit?: number;
    offset?: number;
}, connectedDatabase?: sqlite.Database): RecordUpdateLog[];

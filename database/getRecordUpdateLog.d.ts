import sqlite from 'better-sqlite3';
export declare const defaultRecordLimit = 100;
export type RecordType = 'burialSite' | 'burialSiteComment' | 'comments' | 'contract' | 'contractComment' | 'contractFee' | 'contractTransactions' | 'workOrder' | 'workOrderComment' | 'workOrderMilestone';
export interface RecordUpdateLog {
    recordType: RecordType;
    updateType: 'create' | 'update';
    displayRecordId: string;
    recordId: number;
    recordDescription: string;
    recordCreate_timeMillis: number;
    recordCreate_userName: string;
    recordUpdate_timeMillis: number;
    recordUpdate_userName: string;
}
export default function getRecordUpdateLog(filters: {
    recordType: '' | RecordType;
}, options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'recordCreate_timeMillis' | 'recordUpdate_timeMillis';
    sortDirection?: 'asc' | 'desc';
}, connectedDatabase?: sqlite.Database): RecordUpdateLog[];

import sqlite from 'better-sqlite3';
export interface AddForm {
    committalType: string;
    committalTypeKey?: string;
    orderNumber?: number | string;
}
export default function addCommittalType(addForm: AddForm, user: User, connectedDatabase?: sqlite.Database): number;

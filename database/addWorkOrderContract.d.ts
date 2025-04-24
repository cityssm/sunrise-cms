import sqlite from 'better-sqlite3';
export interface AddForm {
    contractId: number | string;
    workOrderId: number | string;
}
export default function addWorkOrderContract(addForm: AddForm, user: User, connectedDatabase?: sqlite.Database): boolean;

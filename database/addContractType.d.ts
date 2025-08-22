import sqlite from 'better-sqlite3';
export interface AddForm {
    contractType: string;
    isPreneed?: string;
    orderNumber?: number;
}
export default function addContractType(addForm: AddForm, user: User, connectedDatabase?: sqlite.Database): number;

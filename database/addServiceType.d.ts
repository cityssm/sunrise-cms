import sqlite from 'better-sqlite3';
export interface AddForm {
    serviceType: string;
    orderNumber?: number | string;
}
export default function addServiceType(addForm: AddForm, user: User, connectedDatabase?: sqlite.Database): number;

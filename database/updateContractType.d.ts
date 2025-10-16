import sqlite from 'better-sqlite3';
export interface UpdateForm {
    contractTypeId: number | string;
    contractType: string;
    isPreneed?: string;
}
export default function updateContractType(updateForm: UpdateForm, user: User, connectedDatabase?: sqlite.Database): boolean;

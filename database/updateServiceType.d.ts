import sqlite from 'better-sqlite3';
export interface UpdateForm {
    serviceTypeId: number | string;
    serviceType: string;
}
export default function updateServiceType(updateForm: UpdateForm, user: User, connectedDatabase?: sqlite.Database): boolean;

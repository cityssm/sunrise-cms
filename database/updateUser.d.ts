import sqlite from 'better-sqlite3';
export interface UpdateUserForm {
    userName: string;
    isActive: boolean;
    canUpdateCemeteries: boolean;
    canUpdateContracts: boolean;
    canUpdateWorkOrders: boolean;
    isAdmin: boolean;
}
export default function updateUser(updateForm: UpdateUserForm, user: User, connectedDatabase?: sqlite.Database): boolean;

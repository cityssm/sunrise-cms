import sqlite from 'better-sqlite3';
export interface UpdateUserForm {
    userName: string;
    displayName?: string;
    password?: string;
    canUpdateCemeteries: boolean;
    canUpdateContracts: boolean;
    canUpdateWorkOrders: boolean;
    isAdmin: boolean;
    isActive: boolean;
}
export default function updateUser(updateForm: UpdateUserForm, user: User, connectedDatabase?: sqlite.Database): boolean;

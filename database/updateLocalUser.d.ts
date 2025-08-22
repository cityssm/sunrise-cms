import sqlite from 'better-sqlite3';
export interface UpdateLocalUserOptions {
    userName: string;
    displayName?: string;
    password?: string;
    canUpdateCemeteries: boolean;
    canUpdateContracts: boolean;
    canUpdateWorkOrders: boolean;
    isAdmin: boolean;
    isActive: boolean;
}
export declare function updateLocalUser(userId: number, options: UpdateLocalUserOptions, user: User, connectedDatabase?: sqlite.Database): boolean;
export default updateLocalUser;

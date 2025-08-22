import sqlite from 'better-sqlite3';
export interface LocalUser {
    userId: number;
    userName: string;
    displayName?: string;
    isActive: boolean;
    canUpdateCemeteries: boolean;
    canUpdateContracts: boolean;
    canUpdateWorkOrders: boolean;
    isAdmin: boolean;
    recordCreate_userName: string;
    recordCreate_timeMillis: number;
    recordUpdate_userName: string;
    recordUpdate_timeMillis: number;
}
export declare function getLocalUsers(connectedDatabase?: sqlite.Database): LocalUser[];
export declare function getLocalUser(userName: string, connectedDatabase?: sqlite.Database): LocalUser | undefined;
export default getLocalUsers;

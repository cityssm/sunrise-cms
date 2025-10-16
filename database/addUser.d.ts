import sqlite from 'better-sqlite3';
export interface AddLocalUserOptions {
    userName: string;
    canUpdateCemeteries: boolean;
    canUpdateContracts: boolean;
    canUpdateWorkOrders: boolean;
    isAdmin: boolean;
}
export default function addUser(options: AddLocalUserOptions, user: User, connectedDatabase?: sqlite.Database): boolean;

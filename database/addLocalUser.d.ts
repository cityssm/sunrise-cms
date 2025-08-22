import sqlite from 'better-sqlite3';
export interface AddLocalUserOptions {
    userName: string;
    displayName?: string;
    password: string;
    canUpdateCemeteries: boolean;
    canUpdateContracts: boolean;
    canUpdateWorkOrders: boolean;
    isAdmin: boolean;
}
export declare function addLocalUser(options: AddLocalUserOptions, user: User, connectedDatabase?: sqlite.Database): number;
export default addLocalUser;

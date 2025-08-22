import sqlite from 'better-sqlite3';
export declare function authenticateLocalUser(userName: string, password: string, connectedDatabase?: sqlite.Database): boolean;
export default authenticateLocalUser;

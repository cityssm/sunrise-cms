import sqlite from 'better-sqlite3';
export declare function deleteLocalUser(userName: string, user: User, connectedDatabase?: sqlite.Database): boolean;
export default deleteLocalUser;

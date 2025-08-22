import sqlite from 'better-sqlite3';
export declare function deleteLocalUser(userId: number, user: User, connectedDatabase?: sqlite.Database): boolean;
export default deleteLocalUser;

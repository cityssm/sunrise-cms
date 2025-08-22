import sqlite from 'better-sqlite3';
export declare function backupDatabase(connectedDatabase?: sqlite.Database): Promise<false | string>;

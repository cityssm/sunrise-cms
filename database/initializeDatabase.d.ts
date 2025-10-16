import sqlite from 'better-sqlite3';
export declare function initializeDatabase(connectedDatabase?: sqlite.Database): boolean;
export declare function initializeData(connectedDatabase?: sqlite.Database): void;

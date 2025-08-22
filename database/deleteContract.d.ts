import sqlite from 'better-sqlite3';
export declare function deleteContract(contractId: number | string, user: User, connectedDatabase?: sqlite.Database): boolean;

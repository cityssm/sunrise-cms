import sqlite from 'better-sqlite3';
export default function deleteContractInterment(contractId: number | string, intermentNumber: number | string, user: User, connectedDatabase?: sqlite.Database): boolean;

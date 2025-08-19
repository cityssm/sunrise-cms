import sqlite from 'better-sqlite3';
export default function deleteContractTransaction(contractId: number | string, transactionIndex: number | string, user: User, connectedDatabase?: sqlite.Database): boolean;

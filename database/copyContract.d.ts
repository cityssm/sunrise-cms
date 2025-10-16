import sqlite from 'better-sqlite3';
export default function copyContract(oldContractId: number | string, user: User, connectedDatabase?: sqlite.Database): Promise<number>;

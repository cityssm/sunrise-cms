import sqlite from 'better-sqlite3';
export default function getNextContractId(contractId: number | string, connectedDatabase?: sqlite.Database): number | undefined;

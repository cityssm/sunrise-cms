import sqlite from 'better-sqlite3';
export default function getPreviousContractId(contractId: number | string, connectedDatabase?: sqlite.Database): number | undefined;

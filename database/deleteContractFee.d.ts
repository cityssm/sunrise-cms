import sqlite from 'better-sqlite3';
export default function deleteContractFee(contractId: number | string, feeId: number | string, user: User, connectedDatabase?: sqlite.Database): boolean;

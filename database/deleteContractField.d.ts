import sqlite from 'better-sqlite3';
export default function deleteContractField(contractId: number | string, contractTypeFieldId: number | string, user: User, connectedDatabase?: sqlite.Database): boolean;

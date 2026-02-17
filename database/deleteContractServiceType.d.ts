import sqlite from 'better-sqlite3';
export default function deleteContractServiceType(contractId: number | string, serviceTypeId: number | string, user: User, connectedDatabase?: sqlite.Database): boolean;

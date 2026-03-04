import sqlite from 'better-sqlite3';
export type PurgeAuditLogAge = 'all' | 'oneYear' | 'ninetyDays' | 'thirtyDays';
export default function purgeAuditLog(age: PurgeAuditLogAge, connectedDatabase?: sqlite.Database): number;

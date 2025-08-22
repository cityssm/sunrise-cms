import sqlite from 'better-sqlite3';
export default function getPreviousCemeteryId(cemeteryId: number | string, connectedDatabase?: sqlite.Database): number | undefined;

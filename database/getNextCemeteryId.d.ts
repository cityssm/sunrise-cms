import sqlite from 'better-sqlite3';
export default function getNextCemeteryId(cemeteryId: number | string, connectedDatabase?: sqlite.Database): number | undefined;

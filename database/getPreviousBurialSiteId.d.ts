import sqlite from 'better-sqlite3';
export default function getPreviousBurialSiteId(burialSiteId: number | string, connectedDatabase?: sqlite.Database): number | undefined;

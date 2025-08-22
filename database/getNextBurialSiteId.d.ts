import sqlite from 'better-sqlite3';
export default function getNextBurialSiteId(burialSiteId: number | string, connectedDatabase?: sqlite.Database): number | undefined;
